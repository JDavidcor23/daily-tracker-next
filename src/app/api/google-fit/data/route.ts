import { NextResponse } from 'next/server';
import * as googleapis from 'googleapis';
const { google } = googleapis;
import { getGoogleFitOAuth2Client, loadTokens, saveTokens } from '@/lib/google-fit';

export async function GET(request: Request) {
  const oauth2Client = getGoogleFitOAuth2Client();
  if (!oauth2Client) {
    return NextResponse.json({ success: false, error: 'Google Fit not configured' }, { status: 503 });
  }

  const tokens = await loadTokens();
  if (!tokens) {
    return NextResponse.json({ success: false, error: 'Google Fit not connected' }, { status: 401 });
  }

  oauth2Client.setCredentials(tokens);

  // Note: Next.js Route Handlers are stateless, so we can't easily use the 'tokens' event for auto-refresh
  // without specialized logic. However, googleapis usually handles refresh automatically if refresh_token is present.
  // If we wanted to save the new tokens, we'd need to check if they changed after the call.

  const fitness = google.fitness({ version: 'v1', auth: oauth2Client });
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');

  const now = new Date();
  let startForPeriod = new Date();
  
  if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startForPeriod.setDate(diff);
  } else if (period === 'month') {
    startForPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  startForPeriod.setHours(0, 0, 0, 0);
  const startTimeMillis = startForPeriod.getTime().toString();
  const endTimeMillis = now.getTime().toString();

  try {
    const result: any = { steps: 0, calories: 0, distance: 0, activeMinutes: 0, sleepMinutes: 0 };
    const dataTypeMap = [
      { type: 'com.google.step_count.delta', key: 'steps', extract: (v: any) => v.intVal || 0 },
      { type: 'com.google.calories.expended', key: 'calories', extract: (v: any) => Math.round(v.fpVal || 0) },
      { type: 'com.google.distance.delta', key: 'distance', extract: (v: any) => Math.round((v.fpVal || 0) / 1000 * 100) / 100 },
      { type: 'com.google.active_minutes', key: 'activeMinutes', extract: (v: any) => v.intVal || 0 },
    ];

    for (const { type, key, extract } of dataTypeMap) {
      try {
        const aggRes = await fitness.users.dataset.aggregate({
          userId: 'me',
          requestBody: {
            aggregateBy: [{ dataTypeName: type }],
            bucketByTime: { durationMillis: '86400000' },
            startTimeMillis,
            endTimeMillis,
          },
        });
        for (const bucket of aggRes.data.bucket || []) {
          for (const ds of bucket.dataset || []) {
            for (const point of ds.point || []) {
              const val = point.value?.[0];
              if (val) result[key] += extract(val);
            }
          }
        }
      } catch (dtErr: any) {
        console.warn(`Skipping ${type}:`, dtErr.message);
      }
    }

    // Sleep
    try {
      const sleepStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sleepRes = await fitness.users.sessions.list({
        userId: 'me',
        startTime: sleepStart.toISOString(),
        endTime: now.toISOString(),
        activityType: [72], 
      });
      for (const session of sleepRes.data.session || []) {
        // Sleep sessions have activityType 72
        if (session.activityType === 72) {
          const start = parseInt(session.startTimeMillis!, 10);
          const end = parseInt(session.endTimeMillis!, 10);
          result.sleepMinutes += Math.round((end - start) / 60000);
        }
      }
    } catch (sleepErr: any) {
      console.warn('Sleep data fetch failed:', sleepErr.message);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Fitness API error: ' + err.message }, { status: 500 });
  }
}

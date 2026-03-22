import { NextResponse } from 'next/server';
import { getGoogleFitOAuth2Client, GOOGLE_FIT_SCOPES } from '@/lib/google-fit';

export async function GET() {
  const oauth2Client = getGoogleFitOAuth2Client();
  if (!oauth2Client) {
    return NextResponse.json({ success: false, error: 'Google Fit not configured' }, { status: 503 });
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_FIT_SCOPES,
    prompt: 'consent',
  });

  return NextResponse.json({ success: true, data: { url: authUrl } });
}

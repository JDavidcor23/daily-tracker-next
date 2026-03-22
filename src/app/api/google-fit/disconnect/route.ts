import { NextResponse } from 'next/server';
import { deleteTokens, getGoogleFitOAuth2Client } from '@/lib/google-fit';

export async function POST() {
  try {
    deleteTokens();
    const oauth2Client = getGoogleFitOAuth2Client();
    if (oauth2Client) {
      oauth2Client.revokeCredentials().catch(() => {});
    }
    return NextResponse.json({ success: true, data: { disconnected: true } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

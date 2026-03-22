import { NextResponse } from 'next/server';
import { getGoogleFitOAuth2Client, loadTokens } from '@/lib/google-fit';

export async function GET() {
  const oauth2Client = getGoogleFitOAuth2Client();
  if (!oauth2Client) {
    return NextResponse.json({ success: true, data: { connected: false, configured: false } });
  }

  const tokens = loadTokens();
  return NextResponse.json({ success: true, data: { connected: !!tokens, configured: true } });
}

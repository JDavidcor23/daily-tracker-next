import { NextResponse } from 'next/server';
import { deleteTokens, getGoogleFitOAuth2Client, loadTokens } from '@/lib/google-fit';

export async function POST() {
  try {
    // Try to revoke the token before deleting
    const oauth2Client = getGoogleFitOAuth2Client();
    if (oauth2Client) {
      const tokens = await loadTokens();
      if (tokens?.access_token) {
        oauth2Client.setCredentials(tokens);
        oauth2Client.revokeCredentials().catch(() => {});
      }
    }
    await deleteTokens();
    return NextResponse.json({ success: true, data: { disconnected: true } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

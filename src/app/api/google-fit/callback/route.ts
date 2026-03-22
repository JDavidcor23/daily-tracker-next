import { NextResponse } from 'next/server';
import { getGoogleFitOAuth2Client, saveTokens } from '@/lib/google-fit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing authorization code' }, { status: 400 });
  }

  const oauth2Client = getGoogleFitOAuth2Client();
  if (!oauth2Client) {
    return NextResponse.json({ success: false, error: 'Google Fit not configured' }, { status: 503 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    saveTokens(tokens);
    
    // Redirect to frontend settings page
    const frontendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
    return NextResponse.redirect(`${frontendUrl}/settings?google_fit=connected`);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Token exchange failed: ' + err.message }, { status: 500 });
  }
}

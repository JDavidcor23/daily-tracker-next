import * as googleapis from 'googleapis';
const { google } = googleapis;
import { supabase } from '@/lib/supabase';

const GOOGLE_FIT_CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID;
const GOOGLE_FIT_CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET;
const GOOGLE_FIT_REDIRECT_URI = process.env.GOOGLE_FIT_REDIRECT_URI;

// Key used to look up the token row in app_settings
const TOKEN_KEY = 'google_fit_tokens';

export const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.location.read',
];

export function getGoogleFitOAuth2Client() {
  if (!GOOGLE_FIT_CLIENT_ID || !GOOGLE_FIT_CLIENT_SECRET) {
    return null;
  }
  return new google.auth.OAuth2(
    GOOGLE_FIT_CLIENT_ID,
    GOOGLE_FIT_CLIENT_SECRET,
    GOOGLE_FIT_REDIRECT_URI
  );
}

/** Load tokens from Supabase app_settings table */
export async function loadTokens(): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', TOKEN_KEY)
      .single();

    if (error || !data) return null;
    return data.value;
  } catch {
    return null;
  }
}

/** Save tokens to Supabase app_settings table (upsert) */
export async function saveTokens(tokens: any): Promise<void> {
  await supabase
    .from('app_settings')
    .upsert({ key: TOKEN_KEY, value: tokens }, { onConflict: 'key' });
}

/** Delete tokens from Supabase app_settings table */
export async function deleteTokens(): Promise<void> {
  await supabase
    .from('app_settings')
    .delete()
    .eq('key', TOKEN_KEY);
}

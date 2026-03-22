import * as googleapis from 'googleapis';
const { google } = googleapis;
import fs from 'fs';
import path from 'path';

const GOOGLE_FIT_CLIENT_ID = process.env.GOOGLE_FIT_CLIENT_ID;
const GOOGLE_FIT_CLIENT_SECRET = process.env.GOOGLE_FIT_CLIENT_SECRET;
const GOOGLE_FIT_REDIRECT_URI = process.env.GOOGLE_FIT_REDIRECT_URI;
const TOKENS_PATH = path.join(process.cwd(), 'google_fit_tokens.json');

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

export function loadTokens() {
  try {
    if (fs.existsSync(TOKENS_PATH)) {
      return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
    }
  } catch { /* ignore */ }
  return null;
}

export function saveTokens(tokens: any) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf8');
}

export function deleteTokens() {
  if (fs.existsSync(TOKENS_PATH)) {
    fs.unlinkSync(TOKENS_PATH);
  }
}

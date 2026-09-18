import { google } from 'googleapis';
import { ApiError } from '../../utils/ApiError.js';

export function getGoogleApiCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApiError(
      500,
      'Google API credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI) are not configured in environment variables.'
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function createOAuthClient(overrideRedirectUri?: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleApiCredentials();
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    overrideRedirectUri ?? redirectUri
  );
}

export function getAuthorizedClient(refreshToken: string) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}


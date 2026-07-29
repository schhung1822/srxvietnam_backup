  import { NextResponse } from 'next/server';
import { query } from '../../../../../src/lib/server/db.js';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getClientIp,
  getSessionCookieOptions,
  getSessionExpiryDate,
  getUserAgent,
} from '../../../../../src/lib/server/auth.js';
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  exchangeGoogleCode,
  findOrCreateGoogleUser,
  getGoogleOAuthConfig,
  isSameState,
  readGoogleProfileFromIdToken,
  resolveGoogleRedirectUri,
  unpackStateCookie,
} from '../../../../../src/lib/server/google-oauth.js';
import { resolveRequestOrigin } from '../../../../../src/lib/server/request-origin.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectWithError(origin, nextPath, errorCode) {
  const redirectUrl = new URL(nextPath, origin);
  redirectUrl.searchParams.set('authError', errorCode);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const origin = resolveRequestOrigin(request);
  const storedState = unpackStateCookie(request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value);
  const nextPath = storedState?.nextPath ?? '/account';

  try {
    if (requestUrl.searchParams.get('error')) {
      return redirectWithError(origin, nextPath, 'google_cancelled');
    }

    const { isConfigured } = getGoogleOAuthConfig();

    if (!isConfigured) {
      return redirectWithError(origin, nextPath, 'google_not_configured');
    }

    const code = requestUrl.searchParams.get('code');

    if (!code || !storedState || !isSameState(requestUrl.searchParams.get('state'), storedState.state)) {
      return redirectWithError(origin, nextPath, 'google_state_mismatch');
    }

    const tokenPayload = await exchangeGoogleCode({
      code,
      redirectUri: resolveGoogleRedirectUri(request),
    });

    const profile = readGoogleProfileFromIdToken(tokenPayload.id_token);

    if (!profile.email || !profile.emailVerified) {
      return redirectWithError(origin, nextPath, 'google_email_unverified');
    }

    const { user } = await findOrCreateGoogleUser(profile);

    if (!user) {
      return redirectWithError(origin, nextPath, 'google_failed');
    }

    if (['inactive', 'banned'].includes(user.status)) {
      return redirectWithError(origin, nextPath, 'account_disabled');
    }

    const sessionToken = createSessionToken();
    const expiresAt = getSessionExpiryDate();

    await query(
      `
        INSERT INTO user_sessions (
          user_id,
          session_token,
          device_name,
          ip_address,
          user_agent,
          last_activity_at,
          expires_at
        )
        VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `,
      [user.id, sessionToken, 'Google Sign-In', getClientIp(request), getUserAgent(request), expiresAt],
    );

    const response = NextResponse.redirect(new URL(nextPath, origin));
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions(expiresAt));
    response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return redirectWithError(origin, nextPath, 'google_failed');
  }
}

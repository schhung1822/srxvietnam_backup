import { NextResponse } from 'next/server';
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
  buildGoogleAuthUrl,
  createOAuthState,
  getGoogleOAuthConfig,
  packStateCookie,
  resolveGoogleRedirectUri,
  sanitizeNextPath,
} from '../../../../../src/lib/server/google-oauth.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get('next'));

  try {
    const { isConfigured } = getGoogleOAuthConfig();

    if (!isConfigured) {
      return NextResponse.redirect(new URL(`${nextPath}?authError=google_not_configured`, requestUrl.origin));
    }

    const state = createOAuthState();
    const redirectUri = resolveGoogleRedirectUri(request);
    const response = NextResponse.redirect(buildGoogleAuthUrl({ state, redirectUri }));

    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, packStateCookie(state, nextPath), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Google OAuth start error:', error);
    return NextResponse.redirect(new URL(`${nextPath}?authError=google_failed`, requestUrl.origin));
  }
}

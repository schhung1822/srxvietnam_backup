import { NextResponse } from 'next/server';
import { query } from '../../../../src/lib/server/db.js';
import { formatUser, SESSION_COOKIE_NAME } from '../../../../src/lib/server/auth.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    const users = await query(
      `
        SELECT
          u.id,
          u.email,
          u.phone,
          u.full_name,
          u.display_name,
          u.status,
          u.avatar_url,
          u.created_at
        FROM user_sessions s
        INNER JOIN users u ON u.id = s.user_id
        WHERE s.session_token = ?
          AND s.expires_at > NOW()
          AND u.deleted_at IS NULL
        LIMIT 1
      `,
      [sessionToken]
    );

    if (!users.length) {
      const response = NextResponse.json({ user: null });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    await query(`UPDATE user_sessions SET last_activity_at = NOW() WHERE session_token = ?`, [sessionToken]);
    return NextResponse.json({ user: formatUser(users[0]) });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

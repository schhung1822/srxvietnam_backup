import { NextResponse } from 'next/server';
import { query } from '../../../../src/lib/server/db.js';
import { SESSION_COOKIE_NAME } from '../../../../src/lib/server/auth.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await query(`DELETE FROM user_sessions WHERE session_token = ?`, [sessionToken]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Không thể đăng xuất.' }, { status: 500 });
  }
}

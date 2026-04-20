import { SESSION_COOKIE_NAME } from './auth.js';
import { query } from './db.js';

const baseUserColumns = `
  u.id,
  u.email,
  u.phone,
  u.full_name,
  u.display_name,
  u.status,
  u.avatar_url,
  u.created_at
`;

export async function getAuthenticatedUserRow(request, { includePasswordHash = false } = {}) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const passwordColumn = includePasswordHash ? ', u.password_hash' : '';
  const users = await query(
    `
      SELECT
        ${baseUserColumns}
        ${passwordColumn}
      FROM user_sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.session_token = ?
        AND s.expires_at > NOW()
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [sessionToken],
  );

  if (!users.length) {
    return null;
  }

  await query(`UPDATE user_sessions SET last_activity_at = NOW() WHERE session_token = ?`, [sessionToken]);
  return users[0];
}

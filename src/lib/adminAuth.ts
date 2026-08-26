import crypto from 'crypto';

const SECRET_KEY = process.env.ADMIN_SECRET_TOKEN || 'bbc_production_admin_secure_signing_salt_2026';

export interface AdminSessionPayload {
  role: 'admin';
  authenticated: boolean;
  issuedAt: number;
  expiresAt: number;
}

export function signAdminToken(): string {
  const payload: AdminSessionPayload = {
    role: 'admin',
    authenticated: true,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token: string | null | undefined): AdminSessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(encodedPayload)
    .digest('base64url');

  // Timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const payloadText = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload: AdminSessionPayload = JSON.parse(payloadText);

    if (!payload.authenticated || payload.role !== 'admin') {
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

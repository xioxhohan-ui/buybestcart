import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { signAdminToken, verifyAdminToken } from '@/lib/adminAuth';

// In-memory rate limiting map for brute-force protection
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  return (forwarded ? forwarded.split(',')[0].trim() : realIp) || '127.0.0.1';
}

// 1. GET: Verify current session authentication
export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get('bbc_admin_session')?.value;
  const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
  const token = cookieToken || authHeader;

  const session = verifyAdminToken(token);

  if (session && session.authenticated) {
    return NextResponse.json({
      authenticated: true,
      role: 'admin',
      expiresAt: session.expiresAt,
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// 2. POST: Authenticate with administrator password
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();

  // Check rate limit lockout
  const attemptRecord = failedAttempts.get(ip);
  if (attemptRecord && attemptRecord.lockedUntil > now) {
    const remainingSecs = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed attempts. Account locked for ${remainingSecs} seconds.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { password, action } = body;

    // Handle logout action
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
      response.cookies.delete('bbc_admin_session');
      return response;
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Password is required.' },
        { status: 400 }
      );
    }

    const inputPassword = password.trim();

    // Explicitly reject any demo or trivial passwords
    if (inputPassword.toLowerCase() === 'admin' || inputPassword.toLowerCase() === 'demo' || inputPassword === '1234') {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    // Resolve configured Admin Password from environment or salted database hash
    const supabase = createServerClient();
    const envAdminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;
    let isMatch = false;

    if (envAdminPassword) {
      const inputHash = crypto.createHash('sha256').update(inputPassword).digest();
      const expectedHash = crypto.createHash('sha256').update(envAdminPassword).digest();
      isMatch = crypto.timingSafeEqual(inputHash, expectedHash);
    } else {
      // Check database settings for custom admin salted hash
      const { data: secSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_security')
        .maybeSingle();

      const secVal = secSetting?.value;

      if (secVal?.password_hash && secVal?.salt) {
        // Salted hash verification (Rule: No Plaintext Passwords in DB)
        const computedHash = crypto
          .createHash('sha256')
          .update(secVal.salt + inputPassword)
          .digest('hex');
        
        const inputBuf = Buffer.from(computedHash, 'utf8');
        const expectedBuf = Buffer.from(secVal.password_hash, 'utf8');
        if (inputBuf.length === expectedBuf.length) {
          isMatch = crypto.timingSafeEqual(inputBuf, expectedBuf);
        }
      } else if (secVal?.password) {
        // Legacy fallback & auto-migration
        const inputHash = crypto.createHash('sha256').update(inputPassword).digest();
        const expectedHash = crypto.createHash('sha256').update(secVal.password).digest();
        isMatch = crypto.timingSafeEqual(inputHash, expectedHash);

        if (isMatch) {
          // Auto-migrate to salted hash
          const salt = crypto.randomBytes(16).toString('hex');
          const password_hash = crypto.createHash('sha256').update(salt + inputPassword).digest('hex');
          await supabase.from('settings').update({
            value: { password_hash, salt, algorithm: 'sha256', updated_at: new Date().toISOString() },
          }).eq('key', 'admin_security');
        }
      } else {
        // Secure production bootstrap default fallback
        const defaultSecret = 'Shohan@BuyBestCart2026!';
        const inputHash = crypto.createHash('sha256').update(inputPassword).digest();
        const expectedHash = crypto.createHash('sha256').update(defaultSecret).digest();
        isMatch = crypto.timingSafeEqual(inputHash, expectedHash);
      }
    }

    if (!isMatch) {
      recordFailedAttempt(ip);

      // Log failed attempt
      try {
        await supabase.from('system_logs').insert([
          {
            level: 'warn',
            category: 'admin_auth',
            message: `Failed admin authentication attempt from IP: ${ip}`,
            metadata: { ip, user_agent: req.headers.get('user-agent') },
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // Non-blocking log
      }

      return NextResponse.json(
        { success: false, error: 'Invalid administrator credentials.' },
        { status: 401 }
      );
    }

    // Reset failed attempts upon successful login
    failedAttempts.delete(ip);

    // Sign secure session token
    const token = signAdminToken();

    // Log successful login
    try {
      await supabase.from('system_logs').insert([
        {
          level: 'info',
          category: 'admin_auth',
          message: `Admin successfully authenticated from IP: ${ip}`,
          metadata: { ip, user_agent: req.headers.get('user-agent') },
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Non-blocking log
    }

    // Return response with secure HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      token,
      message: 'Authentication successful.',
    });

    response.cookies.set({
      name: 'bbc_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// 3. PUT: Update administrator password (Requires valid admin session)
export async function PUT(req: NextRequest) {
  const cookieToken = req.cookies.get('bbc_admin_session')?.value;
  const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
  const token = cookieToken || authHeader;

  const session = verifyAdminToken(token);
  if (!session || !session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const trimmedPassword = newPassword.trim();

    if (trimmedPassword.toLowerCase() === 'admin' || trimmedPassword.toLowerCase() === 'demo' || trimmedPassword === '1234') {
      return NextResponse.json(
        { success: false, error: 'Password cannot be a common or trivial password like admin, demo, or 1234.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Generate cryptographic salt and hash (Never store plaintext passwords in database)
    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = crypto
      .createHash('sha256')
      .update(salt + trimmedPassword)
      .digest('hex');

    const { error } = await supabase.from('settings').upsert(
      {
        key: 'admin_security',
        category: 'security',
        value: {
          password_hash,
          salt,
          algorithm: 'sha256',
          updated_at: now,
        },
        description: 'Admin portal authentication credentials',
        updated_at: now,
      },
      { onConflict: 'key' }
    );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log password change event
    try {
      const ip = getClientIp(req);
      await supabase.from('system_logs').insert([
        {
          level: 'info',
          category: 'admin_security',
          message: `Master Administrator password was successfully updated from IP: ${ip}`,
          metadata: { ip },
          created_at: now,
        },
      ]);
    } catch {
      // Non-blocking log
    }

    return NextResponse.json({
      success: true,
      message: 'Master Administrator password updated successfully.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function recordFailedAttempt(ip: string) {
  const current = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  const newCount = current.count + 1;
  const now = Date.now();

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    failedAttempts.set(ip, {
      count: newCount,
      lockedUntil: now + LOCKOUT_DURATION_MS,
    });
  } else {
    failedAttempts.set(ip, {
      count: newCount,
      lockedUntil: 0,
    });
  }
}

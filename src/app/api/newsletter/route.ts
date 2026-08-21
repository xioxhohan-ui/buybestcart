import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source, region } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // 1. Upsert subscriber record
    const { error: subErr } = await supabase.from('newsletter_subscribers').upsert(
      {
        email: cleanEmail,
        status: 'active',
        source: source || 'homepage_newsletter_box',
        region: region || 'US',
        subscribed_at: now,
      },
      { onConflict: 'email' }
    );

    if (subErr) {
      console.warn('Newsletter subscribe warning:', subErr.message);
    }

    // 2. Log event in system_logs
    await supabase.from('system_logs').insert([
      {
        level: 'info',
        category: 'newsletter_subscription',
        message: `New subscriber joined: ${cleanEmail}`,
        metadata: { email: cleanEmail, source: source || 'homepage_newsletter_box', region: region || 'US' },
        created_at: now,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Thank you! You are now subscribed to The Best Buy Cart Weekly Edit.',
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}

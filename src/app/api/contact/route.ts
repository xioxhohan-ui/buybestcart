import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { triggerRevalidation } from '@/lib/revalidate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const sanitizedSubject = subject || 'Editorial Inquiry';
    const now = new Date().toISOString();

    // 1. Insert into messages table
    const { error: msgErr } = await supabase.from('messages').insert([
      {
        name,
        email,
        subject: sanitizedSubject,
        message,
        status: 'unread',
        created_at: now,
      },
    ]);

    // 2. Insert into system_logs table
    const { error: logErr } = await supabase.from('system_logs').insert([
      {
        level: 'info',
        category: 'contact_message',
        message: `New contact message from ${name} (${email}): ${sanitizedSubject}`,
        metadata: { name, email, subject: sanitizedSubject, message },
        created_at: now,
      },
    ]);

    if (msgErr && logErr) {
      console.warn('Supabase log insert notice:', msgErr.message || logErr.message);
    }

    // 3. Revalidate cache for real-time admin update
    await triggerRevalidation();

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received by our editorial team.',
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}

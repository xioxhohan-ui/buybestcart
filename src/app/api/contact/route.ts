import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { triggerRevalidation } from '@/lib/revalidate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Your name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().toLowerCase().slice(0, 120);
    const cleanSubject = (subject && typeof subject === 'string' ? subject.trim().slice(0, 150) : '') || 'Editorial Inquiry';
    const cleanMessage = message.trim().slice(0, 5000);

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // 1. Insert into messages table
    const { error: msgErr } = await supabase.from('messages').insert([
      {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'unread',
        created_at: now,
      },
    ]);

    if (msgErr) {
      console.warn('Supabase messages insert notice:', msgErr.message);
    }

    // 2. Insert into system_logs table
    await supabase.from('system_logs').insert([
      {
        level: 'info',
        category: 'contact_message',
        message: `New contact message from ${cleanName} (${cleanEmail}): ${cleanSubject}`,
        metadata: { name: cleanName, email: cleanEmail, subject: cleanSubject },
        created_at: now,
      },
    ]);

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

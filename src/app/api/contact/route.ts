import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { triggerRevalidation } from '@/lib/revalidate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // 1. Log contact message to system_logs for real-time admin notification
    await supabase.from('system_logs').insert([
      {
        level: 'info',
        category: 'contact_message',
        message: `New editorial inquiry from ${name} (${email}): "${subject || 'General'}"`,
        metadata: { name, email, subject: subject || 'General Inquiry', message },
      },
    ]);

    // 2. Try inserting into messages table if schema exists
    try {
      await supabase.from('messages').insert([
        {
          name,
          email,
          subject: subject || 'General Inquiry',
          message,
          status: 'unread',
        },
      ]);
    } catch {
      // Ignore if messages table schema is not initialized yet
    }

    // 3. Trigger real-time cache revalidation for admin logs and dashboard
    await triggerRevalidation('/shohan/logs');
    await triggerRevalidation('/shohan/dashboard');

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

import { NextResponse } from 'next/server';
import { encryptPayload } from '@/lib/encryption';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { sessionData } = await req.json();

    if (!sessionData) {
      return NextResponse.json({ error: 'No session data provided' }, { status: 400 });
    }

    // Encrypt the raw session JSON using AES-256
    const encrypted = encryptPayload(JSON.stringify(sessionData));

    // Store the encrypted payload in a secure HTTP-Only cookie
    const cookieStore = await cookies();
    cookieStore.set('_secure_admin_vault', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days vault life
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Vault Error]:', err);
    return NextResponse.json({ error: 'Failed to vault session' }, { status: 500 });
  }
}

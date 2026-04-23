import { NextResponse } from 'next/server';
import { decryptPayload } from '@/lib/encryption';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    
    // 1. Fetch site settings to validate the PIN
    const { data: settings, error: fetchErr } = await supabaseAdmin
      .from('site_settings')
      .select('id, admin_pin, lock_failures')
      .limit(1)
      .single();

    if (fetchErr || !settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 });
    }
    
    // If no PIN is configured, use '1234' as default for testing purposes.
    const validPin = settings.admin_pin || '1234';

    if (pin !== validPin) {
      // Increment failure count
      const newFailures = (settings.lock_failures || 0) + 1;
      await supabaseAdmin
        .from('site_settings')
        .update({ lock_failures: newFailures })
        .eq('id', settings.id);
        
      if (newFailures >= 5) {
        // Trigger hard lock on the front end
        return NextResponse.json({ error: 'Too many failed attempts.', hard_lock: true }, { status: 403 });
      }

      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    // 2. PIN is valid. Reset failures.
    if ((settings.lock_failures || 0) > 0) {
      await supabaseAdmin
        .from('site_settings')
        .update({ lock_failures: 0 })
        .eq('id', settings.id);
    }

    // 3. Unvault the token
    const cookieStore = await cookies();
    const vaultCookie = cookieStore.get('_secure_admin_vault');
    
    if (!vaultCookie?.value) {
      return NextResponse.json({ error: 'No vaulted session found. You may need to log in again.', hard_lock: true }, { status: 404 });
    }

    try {
      const decryptedStr = decryptPayload(vaultCookie.value);
      const sessionData = JSON.parse(decryptedStr);
      
      // Cleanup the vault cookie
      cookieStore.delete('_secure_admin_vault');

      return NextResponse.json({ success: true, sessionData });
    } catch {
      return NextResponse.json({ error: 'Vault corrupted or expired', hard_lock: true }, { status: 400 });
    }
    
  } catch (err: any) {
    console.error('[Unvault Error]:', err);
    return NextResponse.json({ error: 'Failed to unvault session' }, { status: 500 });
  }
}

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derives a consistent 32-byte key from the service role key 
 * to ensure we always have exactly 32 bytes for AES-256.
 */
function getDerivedKey(): Buffer {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for encryption');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptPayload(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getDerivedKey();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptPayload(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }
  
  const [ivHex, authTagHex, encryptedHash] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getDerivedKey();
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHash, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

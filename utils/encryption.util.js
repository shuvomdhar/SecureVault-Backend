import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.FIELD_ENCRYPTION_SECRET 
  ? crypto.createHash('sha256').update(process.env.FIELD_ENCRYPTION_SECRET).digest()
  : crypto.createHash('sha256').update('default_secure_vault_secret_key_2026').digest();

/**
 * Encrypt a string using AES-256-GCM
 */
export const encryptValue = (text) => {
  if (text === undefined || text === null) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt an AES-256-GCM encrypted string
 */
export const decryptValue = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string') return encryptedData;
  const parts = encryptedData.split(':');
  
  // If not in encrypted format (e.g., legacy or unencrypted), return as is
  if (parts.length !== 3) return encryptedData;
  
  try {
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return '*** Decryption Error ***';
  }
};

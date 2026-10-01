import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Utility', () => {
  it('should hash and verify passwords correctly', async () => {
    const raw = 'mySecurePassword123!';
    const hashed = await hashPassword(raw);
    
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(raw);
    expect(hashed.startsWith('$argon2id')).toBe(true);

    const isValid = await verifyPassword(raw, hashed);
    expect(isValid).toBe(true);
  });

  it('should reject invalid passwords', async () => {
    const raw = 'mySecurePassword123!';
    const hashed = await hashPassword(raw);
    
    const isValid = await verifyPassword('wrongpassword', hashed);
    expect(isValid).toBe(false);
  });
});

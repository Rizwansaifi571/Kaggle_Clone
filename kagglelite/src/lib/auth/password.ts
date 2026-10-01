import * as argon2 from 'argon2';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (e) {
    return await bcrypt.hash(password, 10);
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('$argon2')) {
      return await argon2.verify(hash, password);
    } else {
      return await bcrypt.compare(password, hash);
    }
  } catch (e) {
    return false;
  }
}

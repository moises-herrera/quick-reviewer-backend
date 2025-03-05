import crypto from 'node:crypto';

export class CryptoService {
  static generateRandomBytes(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

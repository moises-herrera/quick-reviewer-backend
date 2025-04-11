import { CryptoService } from 'src/common/services/crypto.service';

describe('CryptoService', () => {
  it('should generate random bytes of the specified length', () => {
    const length = 16;
    const randomBytes = CryptoService.generateRandomBytes(length);
    expect(randomBytes).toHaveLength(length * 2);
  });
});

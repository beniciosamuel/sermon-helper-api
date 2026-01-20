import { Password } from '../../../services/Password';
import argon2 from 'argon2';

// Mock argon2 module
jest.mock('argon2');

const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe('Password', () => {
  let password: Password;

  beforeEach(() => {
    jest.clearAllMocks();
    password = new Password();
  });

  describe('encrypt', () => {
    it('should hash password successfully with argon2id', async () => {
      // Arrange
      const plainPassword = 'mySecurePassword123';
      const expectedHash = '$argon2id$v=19$m=65536,t=3,p=4$hashedValue';
      mockArgon2.hash.mockResolvedValue(expectedHash);

      // Act
      const result = await password.encrypt(plainPassword);

      // Assert
      expect(result).toBe(expectedHash);
      expect(mockArgon2.hash).toHaveBeenCalledWith(plainPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    });

    it('should throw error when argon2 hash fails', async () => {
      // Arrange
      const plainPassword = 'mySecurePassword123';
      const hashError = new Error('Memory allocation failed');
      mockArgon2.hash.mockRejectedValue(hashError);

      // Act & Assert
      await expect(password.encrypt(plainPassword)).rejects.toThrow(
        `Failed to encrypt password: ${hashError}`
      );
    });
  });

  describe('verify', () => {
    it('should return true when password matches hash', async () => {
      // Arrange
      const hash = '$argon2id$v=19$m=65536,t=3,p=4$hashedValue';
      const plainPassword = 'mySecurePassword123';
      mockArgon2.verify.mockResolvedValue(true);

      // Act
      const result = await password.verify(hash, plainPassword);

      // Assert
      expect(result).toBe(true);
      expect(mockArgon2.verify).toHaveBeenCalledWith(hash, plainPassword);
    });

    it('should return false when password does not match hash', async () => {
      // Arrange
      const hash = '$argon2id$v=19$m=65536,t=3,p=4$hashedValue';
      const plainPassword = 'wrongPassword';
      mockArgon2.verify.mockResolvedValue(false);

      // Act
      const result = await password.verify(hash, plainPassword);

      // Assert
      expect(result).toBe(false);
      expect(mockArgon2.verify).toHaveBeenCalledWith(hash, plainPassword);
    });

    it('should throw error when argon2 verify fails', async () => {
      // Arrange
      const hash = 'invalidHash';
      const plainPassword = 'mySecurePassword123';
      const verifyError = new Error('Invalid hash format');
      mockArgon2.verify.mockRejectedValue(verifyError);

      // Act & Assert
      await expect(password.verify(hash, plainPassword)).rejects.toThrow(
        `Failed to verify password: ${verifyError}`
      );
    });
  });
});

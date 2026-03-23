import { Password, PasswordChangePolicyService, PasswordCryptoProvider, PasswordErrors } from '../../src';

const HASHES = [
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWx',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWz',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWa',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWb',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWc',
];

const recentPasswords = HASHES.map((hash) =>
  Password.create({
    content: hash,
  }),
);

describe('PasswordChangePolicyService', () => {
  test('should fail when new password and confirmation do not match', async () => {
    const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(false),
    };

    const result = await PasswordChangePolicyService.validate({
      newPassword: 'NewPassword123!',
      confirmPassword: 'DifferentPassword123!',
      recentPasswords,
      passwordCryptoProvider: mockPasswordCryptoProvider,
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe(PasswordErrors.MISMATCH);
    expect(mockPasswordCryptoProvider.compare).not.toHaveBeenCalled();
  });

  test('should fail when new password is weak', async () => {
    const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(false),
    };

    const result = await PasswordChangePolicyService.validate({
      newPassword: 'weak',
      confirmPassword: 'weak',
      recentPasswords,
      passwordCryptoProvider: mockPasswordCryptoProvider,
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe('WEAK_PASSWORD');
    expect(mockPasswordCryptoProvider.compare).not.toHaveBeenCalled();
  });

  test('should fail when new password matches one of the last five passwords', async () => {
    const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true),
    };

    const result = await PasswordChangePolicyService.validate({
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
      recentPasswords,
      passwordCryptoProvider: mockPasswordCryptoProvider,
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe(PasswordErrors.REUSED_RECENT_PASSWORD);
    expect(mockPasswordCryptoProvider.compare).toHaveBeenCalledTimes(2);
  });

  test('should ignore passwords older than the last five', async () => {
    const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
      hash: jest.fn(),
      compare: jest
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true),
    };

    const result = await PasswordChangePolicyService.validate({
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
      recentPasswords,
      passwordCryptoProvider: mockPasswordCryptoProvider,
    });

    expect(result.isOk).toBe(true);
    expect(mockPasswordCryptoProvider.compare).toHaveBeenCalledTimes(5);
  });

  test('should pass when password is strong, matches confirmation and was not reused', async () => {
    const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(false),
    };

    const result = await PasswordChangePolicyService.validate({
      newPassword: 'BrandNewPassword123!',
      confirmPassword: 'BrandNewPassword123!',
      recentPasswords: recentPasswords.slice(0, 3),
      passwordCryptoProvider: mockPasswordCryptoProvider,
    });

    expect(result.isOk).toBe(true);
    expect(mockPasswordCryptoProvider.compare).toHaveBeenCalledTimes(3);
  });

  test('should respect custom maxRecentPasswordsToCheck when validating reused password', async () => {
    const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true),
    };

    const result = await PasswordChangePolicyService.validate({
      newPassword: 'BrandNewPassword123!',
      confirmPassword: 'BrandNewPassword123!',
      recentPasswords,
      passwordCryptoProvider: mockPasswordCryptoProvider,
      maxRecentPasswordsToCheck: 3,
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe(PasswordErrors.REUSED_RECENT_PASSWORD);
    expect(mockPasswordCryptoProvider.compare).toHaveBeenCalledTimes(3);
  });

  test('should ignore reused password outside custom maxRecentPasswordsToCheck', async () => {
    const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true),
    };

    const result = await PasswordChangePolicyService.validate({
      newPassword: 'BrandNewPassword123!',
      confirmPassword: 'BrandNewPassword123!',
      recentPasswords,
      passwordCryptoProvider: mockPasswordCryptoProvider,
      maxRecentPasswordsToCheck: 2,
    });

    expect(result.isOk).toBe(true);
    expect(mockPasswordCryptoProvider.compare).toHaveBeenCalledTimes(2);
  });
});

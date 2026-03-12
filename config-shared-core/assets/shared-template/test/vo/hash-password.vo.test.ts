import { HashPassword } from '../../src';

describe('HashPassword', () => {
  test('should create hash password with tryCreate', () => {
    const value = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    const result = HashPassword.tryCreate(value);

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe(value);
  });

  test('should create hash password with create', () => {
    const value = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    const hashPassword = HashPassword.create(value);

    expect(hashPassword.value).toBe(value);
  });

  test('should fail when value is not a bcrypt hash', () => {
    const result = HashPassword.tryCreate('Aa123456!');

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_HASH_PASSWORD');
  });

  test('should normalize value with trim before validating hash', () => {
    const value = '  $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy  ';
    const result = HashPassword.tryCreate(value);

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
  });

  test('should fail when value is undefined', () => {
    const result = HashPassword.tryCreate(undefined as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('INVALID_HASH_PASSWORD');
  });
});

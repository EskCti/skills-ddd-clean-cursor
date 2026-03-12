import { ShortDescription } from '../../src';

describe('ShortDescription', () => {
  test('should create valid short description with tryCreate', () => {
    const result = ShortDescription.tryCreate('Descricao curta valida.');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('Descricao curta valida.');
  });

  test('should trim short description before creating', () => {
    const result = ShortDescription.tryCreate('   Esta e uma descricao curta valida.   ');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('Esta e uma descricao curta valida.');
  });

  test('should fail when short description is shorter than minimum length', () => {
    const result = ShortDescription.tryCreate('a'.repeat(14));

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('SHORT_DESCRIPTION_TOO_SHORT');
  });

  test('should fail when short description is longer than maximum length', () => {
    const result = ShortDescription.tryCreate('a'.repeat(81));

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('SHORT_DESCRIPTION_TOO_LONG');
  });

  test('should ignore max validation when maxLength is 0', () => {
    const result = ShortDescription.tryCreate('a'.repeat(120), {
      maxLength: 0,
    });

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('a'.repeat(120));
  });

  test('should fail when short description is undefined', () => {
    const result = ShortDescription.tryCreate(undefined as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('SHORT_DESCRIPTION_TOO_SHORT');
  });

  test('should create with create method', () => {
    const shortDescription = ShortDescription.create('  Esta e uma descricao curta criada com sucesso.  ');

    expect(shortDescription.value).toBe('Esta e uma descricao curta criada com sucesso.');
  });

  test('should throw when create receives invalid short description', () => {
    expect(() => ShortDescription.create('muito curta')).toThrow();
  });
});

import { Description } from '../../src';

describe('Description', () => {
  test('should create valid description with tryCreate', () => {
    const result = Description.tryCreate('Esta descricao possui tamanho suficiente para ser valida.');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('Esta descricao possui tamanho suficiente para ser valida.');
  });

  test('should trim description before creating', () => {
    const result = Description.tryCreate('   Esta descricao tambem possui tamanho minimo valido.   ');

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('Esta descricao tambem possui tamanho minimo valido.');
  });

  test('should fail when description is shorter than minimum length', () => {
    const result = Description.tryCreate('a'.repeat(19));

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('DESCRIPTION_TOO_SHORT');
  });

  test('should fail when description is longer than maximum length', () => {
    const result = Description.tryCreate('a'.repeat(2001));

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('DESCRIPTION_TOO_LONG');
  });

  test('should ignore max validation when maxLength is 0', () => {
    const result = Description.tryCreate('a'.repeat(2500), { maxLength: 0 });

    expect(result.isOk).toBe(true);
    expect(result.instance.value).toBe('a'.repeat(2500));
  });

  test('should fail when description is undefined', () => {
    const result = Description.tryCreate(undefined as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.errors).toContain('DESCRIPTION_TOO_SHORT');
  });

  test('should create with create method', () => {
    const description = Description.create('  Esta descricao foi criada com o metodo create com sucesso.  ');

    expect(description.value).toBe('Esta descricao foi criada com o metodo create com sucesso.');
  });

  test('should throw when create receives invalid description', () => {
    expect(() => Description.create('descricao curta')).toThrow();
  });
});

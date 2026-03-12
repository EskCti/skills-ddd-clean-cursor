import { TestEntity } from '../data/test.entity';

describe('Entity', () => {
  describe('creation', () => {
    test('should create entity with provided id', () => {
      const providedId = '550e8400-e29b-41d4-a716-446655440000';
      const result = TestEntity.tryCreate({
        id: providedId,
        number: 42,
      });

      expect(result.isOk).toBe(true);
      expect(
        result.instance.equals(
          TestEntity.tryCreate({
            id: providedId,
            number: 999,
          }).instance,
        ),
      ).toBe(true);
    });

    test('should generate id when not provided', () => {
      const result = TestEntity.tryCreate({ number: 42 });

      expect(result.isOk).toBe(true);
    });

    test('should initialize default timestamps and deletedAt as null', () => {
      const entity = TestEntity.create({ number: 42 });

      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.deletedAt).toBeNull();
    });

    test('should keep provided timestamps and deletedAt', () => {
      const createdAt = new Date('2024-01-01T10:00:00.000Z');
      const updatedAt = new Date('2024-01-02T11:00:00.000Z');
      const deletedAt = new Date('2024-01-03T12:00:00.000Z');

      const entity = TestEntity.create({
        number: 42,
        createdAt,
        updatedAt,
        deletedAt,
      });

      expect(entity.createdAt).toBe(createdAt);
      expect(entity.updatedAt).toBe(updatedAt);
      expect(entity.deletedAt).toBe(deletedAt);
    });
  });

  describe('static create method', () => {
    test('should create instance', () => {
      const entity = TestEntity.create({ number: 42 });

      expect(entity).toBeInstanceOf(TestEntity);
      expect(entity.number).toBe(42);
    });

    test('should throw when creating invalid instance', () => {
      expect(() => TestEntity.create({ number: -1 })).toThrow();
    });
  });

  describe('equality', () => {
    test('should say that instances are equal if they have the same id', () => {
      const providedId = '550e8400-e29b-41d4-a716-446655440000';
      const entity1 = TestEntity.tryCreate({
        id: providedId,
        number: 42,
      }).instance;
      const entity2 = TestEntity.tryCreate({
        id: providedId,
        number: 999,
      }).instance;

      expect(entity1.equals(entity2)).toBe(true);
    });

    test('should say that instances are different if they have different ids', () => {
      const entity1 = TestEntity.tryCreate({ number: 42 }).instance;
      const entity2 = TestEntity.tryCreate({ number: 42 }).instance;

      expect(entity1.notEquals(entity2)).toBe(true);
    });
  });

  describe('cloneWith', () => {
    test('should clone the entity with new properties', () => {
      const originalEntity = TestEntity.tryCreate({
        number: 1,
        obj: { a: 1, b: 2 },
      }).instance;
      const result = originalEntity.cloneWith({
        number: 2,
        obj: { b: 3, c: 4 },
      });
      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity).not.toBe(originalEntity);
      expect(clonedEntity.number).toBe(2);
      expect(clonedEntity.obj).toEqual({ a: 1, b: 3, c: 4 });
      expect(originalEntity.number).toBe(1);
      expect(originalEntity.obj).toEqual({ a: 1, b: 2 });
    });

    test('should not modify the original entity when cloning', () => {
      const originalEntity = TestEntity.tryCreate({ number: 1 }).instance;
      originalEntity.cloneWith({ number: 2 });

      expect(originalEntity.number).toBe(1);
    });
    test('should fail when clone with invalid props', () => {
      const originalEntity = TestEntity.tryCreate({ number: 1 }).instance;
      const result = originalEntity.cloneWith({ number: -2 });

      expect(result.isFailure).toBe(true);
    });

    test('should perform deep merge for nested objects', () => {
      const originalEntity = TestEntity.tryCreate({
        number: 1,
        obj: { nested: { a: 1, b: 2 }, flat: 'test' },
      }).instance;
      const result = originalEntity.cloneWith({
        obj: { nested: { b: 3, c: 4 } },
      });

      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity.obj).toEqual({
        nested: { a: 1, b: 3, c: 4 },
        flat: 'test',
      });
      expect(originalEntity.obj).toEqual({
        nested: { a: 1, b: 2 },
        flat: 'test',
      });
    });

    test('should handle cloning with no overrides', () => {
      const originalEntity = TestEntity.tryCreate({
        number: 1,
        obj: { a: 1 },
      }).instance;
      const result = originalEntity.cloneWith({});
      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity).not.toBe(originalEntity);
      expect(clonedEntity.number).toBe(originalEntity.number);
      expect(clonedEntity.obj).toEqual(originalEntity.obj);
      expect(clonedEntity.id).toBe(originalEntity.id);
    });

    test('should keep unmodified attributes the same when cloning with partial override', () => {
      const originalId = '550e8400-e29b-41d4-a716-446655440001';
      const originalEntity = TestEntity.tryCreate({
        id: originalId,
        number: 10,
        obj: { prop: 'value' },
      }).instance;

      const result = originalEntity.cloneWith({ number: 20 });
      expect(result.isOk).toBeTruthy();
      const clonedEntity = result.instance;

      expect(clonedEntity).not.toBe(originalEntity);
      expect(clonedEntity.number).toBe(20);
      expect(clonedEntity.id).toBe(originalId);
      expect(clonedEntity.obj).toEqual({ prop: 'value' });
    });

    test('should create nested object path when target key does not exist', () => {
      const originalEntity = TestEntity.create({
        number: 1,
      });

      const result = originalEntity.cloneWith({
        obj: { nested: { value: 10 } },
      });

      expect(result.isOk).toBe(true);
      expect(result.instance.obj).toEqual({ nested: { value: 10 } });
      expect(originalEntity.obj).toBeUndefined();
    });

    test('should clone using clone alias', () => {
      const originalEntity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440010',
        number: 10,
        obj: { nested: true },
      });

      const result = originalEntity.clone({ number: 99 });

      expect(result.isOk).toBe(true);
      expect(result.instance.number).toBe(99);
      expect(result.instance.id).toBe(originalEntity.id);
      expect(result.instance.obj).toEqual({ nested: true });
    });

    test('should handle undefined overrides by returning cloned entity', () => {
      const originalEntity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440011',
        number: 10,
        obj: { nested: true },
      });

      const result = originalEntity.cloneWith(undefined as any);

      expect(result.isOk).toBe(true);
      expect(result.instance).not.toBe(originalEntity);
      expect(result.instance.number).toBe(originalEntity.number);
      expect(result.instance.id).toBe(originalEntity.id);
      expect(result.instance.obj).toEqual(originalEntity.obj);
    });
  });

  describe('serialization', () => {
    test('should expose base props with toJSON', () => {
      const createdAt = new Date('2024-02-01T00:00:00.000Z');
      const updatedAt = new Date('2024-02-02T00:00:00.000Z');
      const entity = TestEntity.create({
        id: '550e8400-e29b-41d4-a716-446655440000',
        number: 10,
        obj: { nested: true },
        createdAt,
        updatedAt,
      });

      expect(entity.toJSON()).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        number: 10,
        obj: { nested: true },
        createdAt,
        updatedAt,
        deletedAt: null,
      });
    });
  });
});

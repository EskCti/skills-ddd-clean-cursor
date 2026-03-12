import { Id } from '../vo/id.vo';
import { Result } from './result';

export interface EntityProps {
  id?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export abstract class Entity<Type, Props extends EntityProps> {
  readonly id: string;

  protected constructor(public readonly props: Props) {
    const id = Id.create(props.id!, { attribute: 'id' }).value;
    this.id = id;
    this.props = {
      ...props,
      id,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    };
  }

  get createdAt() {
    return this.props.createdAt!;
  }

  get updatedAt() {
    return this.props.updatedAt!;
  }

  get deletedAt() {
    return this.props?.deletedAt ?? null;
  }

  equals(entity: Entity<Type, Props>): boolean {
    return this.id === entity.id;
  }

  notEquals(entity: Entity<Type, Props>): boolean {
    return this.id !== entity.id;
  }

  public cloneWith(overrides: Partial<Props>): Result<Type> {
    const props = this.props;
    const merged = this.deepMerge(structuredClone(props), overrides);
    return (this.constructor as any).tryCreate(merged);
  }

  public clone(overrides: Partial<Props>): Result<Type> {
    return this.cloneWith(overrides);
  }

  public toJSON(): Props {
    return this.props;
  }

  private deepMerge(target: any, source: any): any {
    if (!source || typeof source !== 'object') {
      return target;
    }

    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
}

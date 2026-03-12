import { Id, Email, Entity, EntityProps, Result, PersonName, URL } from '__SHARED_PACKAGE_NAME__';

export interface UserProps extends EntityProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  admin?: boolean;
}

export class User extends Entity<User, UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  public static create(props: UserProps): User {
    const result = User.tryCreate(props);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(props: UserProps): Result<User> {
    const id = Id.tryCreate(props.id, { attribute: 'id' });
    const email = Email.tryCreate(props.email, { attribute: 'email' });
    const name = PersonName.tryCreate(props.name, { attribute: 'name' });

    const attributes = Result.combine([id, email, name]);
    if (attributes.isFailure) {
      return Result.fail(attributes.errors!);
    }

    return Result.ok(
      new User({
        ...props,
        id: id.instance.value,
        name: name.instance.value,
        email: email.instance.value,
        admin: props.admin ?? false,
      }),
    );
  }

  get name(): string {
    return this.props.name;
  }

  get $name(): PersonName {
    return PersonName.create(this.props.name);
  }

  get email(): string {
    return this.props.email;
  }

  get $email(): Email {
    return Email.create(this.props.email);
  }

  get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
  }

  get admin(): boolean {
    return this.props.admin ?? false;
  }

  get $avatarUrl(): URL | null {
    return this.props.avatarUrl ? URL.create(this.props.avatarUrl) : null;
  }
}

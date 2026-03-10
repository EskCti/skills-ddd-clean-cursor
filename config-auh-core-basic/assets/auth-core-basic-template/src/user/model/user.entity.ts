import {
  Id,
  Email,
  Entity,
  EntityProps,
  Result,
  PersonName,
} from "__SHARED_PACKAGE_NAME__";

export interface UserProps extends EntityProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export class User extends Entity<User, UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get avatarUrl(): string | null | undefined {
    return this.props.avatarUrl;
  }

  public static create(props: UserProps): User {
    const result = User.tryCreate(props);
    result.throwIfFailed();
    return result.instance;
  }

  static tryCreate(props: UserProps): Result<User> {
    const id = Id.tryCreate(props.id, { attribute: "id" });
    const email = Email.tryCreate(props.email, { attribute: "email" });
    const name = PersonName.tryCreate(props.name, { attribute: "name" });

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
      }),
    );
  }
}

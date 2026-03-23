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
  roleIds: string[];
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
  get roleIds(): string[] {
    return this.props.roleIds;
  }

  public static create(props: UserProps): User {
    const result = User.tryCreate(props);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(props: UserProps): Result<User> {
    const id = Id.tryCreate(props.id);
    const email = Email.tryCreate(props.email);
    const name = PersonName.tryCreate(props.name);
    const roles = props.roleIds.map((id) => Id.tryCreate(id));

    const attributes = Result.combine<any>([id, email, name, ...roles]);
    if (attributes.isFailure) {
      return Result.fail(attributes.errors!);
    }

    return Result.ok(
      new User({
        ...props,
        id: id.instance.value,
        name: name.instance.value,
        email: email.instance.value,
        roleIds: roles.map((r) => r.instance.value),
      }),
    );
  }
}

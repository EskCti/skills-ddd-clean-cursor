import { Entity, EntityProps, HashPassword, Result } from "__SHARED_PACKAGE_NAME__";

export interface PasswordProps extends EntityProps {
    content: string;
}

export class Password extends Entity<Password, PasswordProps> {
    protected constructor(props: PasswordProps) {
        super(props);
    }

    get content(): string {
        return this.props.content;
    }

    static create(props: PasswordProps): Password {
        const result = Password.tryCreate(props);
        result.validator.throwsIfFailed();
        return result.instance;
    }

    static tryCreate(props: PasswordProps): Result<Password> {
        const hashPassword = HashPassword.tryCreate(props.content);

        if (hashPassword.isFailure) {
            return Result.fail(hashPassword.errors!);
        }

        return Result.ok(
            new Password({
                ...props,
                content: hashPassword.instance.value,
            }),
        );
    }
}

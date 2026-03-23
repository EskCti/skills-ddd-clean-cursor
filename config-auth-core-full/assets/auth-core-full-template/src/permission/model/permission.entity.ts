import {
    Id,
    Entity,
    EntityProps,
    Result,
    Name,
    DotSeparatedName,
} from "__SHARED_PACKAGE_NAME__";
import { CriticalityLevel } from "./criticality-level.enum";

export interface PermissionProps extends EntityProps {
    name: string;
    alias: string;
    description: string;
    criticality: CriticalityLevel;
}

export class Permission extends Entity<Permission, PermissionProps> {
    private constructor(props: PermissionProps) {
        super(props);
    }

    get name(): string {
        return this.props.name;
    }
    get alias(): string {
        return this.props.alias;
    }
    get description(): string {
        return this.props.description;
    }
    get criticality(): CriticalityLevel {
        return this.props.criticality;
    }

    public static create(props: PermissionProps): Permission {
        const result = Permission.tryCreate(props);
        result.validator.throwsIfFailed();
        return result.instance;
    }

    static tryCreate(props: PermissionProps): Result<Permission> {
        const id = Id.tryCreate(props.id);
        const name = Name.tryCreate(props.name);
        const alias = DotSeparatedName.tryCreate(props.alias);

        const attributes = Result.combine([id, name, alias]);
        if (attributes.isFailure) {
            return Result.fail(attributes.errors!);
        }

        return Result.ok(
            new Permission({
                ...props,
                id: id.instance.value,
                name: name.instance.value,
                alias: alias.instance.value,
                description: props.description,
                criticality: props.criticality,
            }),
        );
    }
}

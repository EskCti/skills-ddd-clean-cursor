import { Resolver } from "react-hook-form";
import {
    ArrayFieldObjects,
    ArrayFieldVO,
    ObjectSchema,
    Schema,
    ValueObjectClass,
    Infer,
    SchemaObject,
    Refinement,
} from "./types";
import {
    isEmptyValue,
    isOptionalField,
    isValueObjectClass,
} from "./type-guards";
import {
    formatRequiredError,
    refinementValidationError,
} from "./error-helpers";
import {
    createValidationResult,
    validateField,
    ValidationContext,
} from "./validators";

export class Validator {
    defineObject<T extends Schema>(schema: T): SchemaObject<T> {
        const refinements: Refinement<Infer<T>>[] = [];

        const obj: SchemaObject<T> = {
            fields: schema,
            _refinements: refinements,
            refine: (check, config) => {
                refinements.push({
                    check,
                    message: config.message,
                    field: config.field,
                });
                return obj;
            },
        };

        return obj;
    }

    // INFO: Overload para optional: true
    defineArray<T, Config extends Record<string, any> = any>(
        item: ValueObjectClass<T, Config>,
        options: {
            optional: true;
            min?: number;
            max?: number;
            config?: Config;
        },
    ): ArrayFieldVO<T, Config> & { optional: true };

    // INFO: Overload para optional: false ou undefined
    defineArray<T, Config extends Record<string, any> = any>(
        item: ValueObjectClass<T, Config>,
        options?: {
            optional?: false;
            min?: number;
            max?: number;
            config?: Config;
        },
    ): ArrayFieldVO<T, Config>;

    // INFO: Overload para arrays de objetos com optional: true
    defineArray<T extends ObjectSchema>(
        item: T,
        options: { optional: true; min?: number; max?: number },
    ): ArrayFieldObjects<T> & { optional: true };

    // INFO: Overload para arrays de objetos com optional: false ou undefined
    defineArray<T extends ObjectSchema>(
        item: T,
        options?: { optional?: false; min?: number; max?: number },
    ): ArrayFieldObjects<T>;

    defineArray(
        item: ValueObjectClass<any> | ObjectSchema,
        options?: {
            optional?: boolean;
            min?: number;
            max?: number;
            config?: any;
        },
    ): ArrayFieldVO<any, any> | ArrayFieldObjects<ObjectSchema> {
        const base = {
            array: true as const,
            ...(options?.optional !== undefined && {
                optional: options.optional,
            }),
            ...(options?.min !== undefined && { min: options.min }),
            ...(options?.max !== undefined && { max: options.max }),
        };

        if (isValueObjectClass(item)) {
            return {
                ...base,
                item,
                ...(options?.config !== undefined && {
                    config: options.config,
                }),
            };
        }

        return {
            ...base,
            item: item as ObjectSchema,
        } as ArrayFieldObjects<ObjectSchema>;
    }

    resolver<T extends Schema>(
        schema: T | SchemaObject<T>,
    ): Resolver<Infer<T>> {
        return async (values) => {
            const context: ValidationContext = {
                errors: {},
                processedValues: {},
            };

            const fields = (schema as SchemaObject<T>).fields ?? schema;
            const refinements = (schema as SchemaObject<T>)._refinements;

            (Object.keys(fields) as Array<keyof T>).forEach((field) => {
                const fieldDef = fields[field];
                if (!fieldDef) return;

                const fieldValue = (values as Record<string, unknown>)[
                    field as string
                ];
                const optional = isOptionalField(fieldDef);

                if (isEmptyValue(fieldValue)) {
                    if (!optional) {
                        context.errors[field as string] = formatRequiredError();
                    }
                    return;
                }

                validateField(fieldDef, fieldValue, context, field as string);
            });

            const result = createValidationResult<T>(context);
            const refinementCtx: ValidationContext = {
                errors: {},
                processedValues: {},
            };

            if (refinements && refinements.length > 0) {
                const data = result.values as Infer<T>;

                for (const refinement of refinements) {
                    const isValid = refinement.check(data);
                    if (!isValid) {
                        const field = refinement.field;
                        refinementCtx.errors[field] = refinementValidationError(
                            refinement.message,
                        );
                    }
                }
            }

            if (Object.keys(result.errors).length > 0) {
                return result;
            }
            const refinementResult = createValidationResult<T>(refinementCtx);
            if (Object.keys(refinementResult.errors).length > 0) {
                return refinementResult;
            }

            return result;
        };
    }
}

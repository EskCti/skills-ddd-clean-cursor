import {
    ArrayField,
    ArrayFieldObjects,
    ObjectSchema,
    SchemaField,
    SchemaObject,
    ValueObjectClass,
} from "./types";

export function isValueObjectClass(
    value: unknown,
): value is ValueObjectClass<any> {
    return (
        typeof value === "function" ||
        (typeof value === "object" &&
            value !== null &&
            "tryCreate" in value &&
            typeof (value as any).tryCreate === "function")
    );
}

export function isObjectSchema(value: unknown): value is ObjectSchema {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    return Object.values(value as ObjectSchema).every((field) => {
        return (
            isValueObjectClass(field) ||
            (typeof field === "object" &&
                field !== null &&
                (("vo" in field && isValueObjectClass(field.vo)) ||
                    ("array" in field && field.array === true)))
        );
    });
}

export function isSchemaObject(value: unknown): value is SchemaObject<any> {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    if (!("fields" in value) || !("refine" in value) || !("_refinements" in value)) {
        return false;
    }

    const candidate = value as SchemaObject<any>;
    return (
        isObjectSchema(candidate.fields) &&
        typeof candidate.refine === "function" &&
        Array.isArray(candidate._refinements)
    );
}

export function isEmptyValue(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    return false;
}

export function isOptionalField(fieldDef: SchemaField<any, any>): boolean {
    if (typeof fieldDef === "object" && "array" in fieldDef) {
        return fieldDef.optional === true;
    }

    if (isSchemaObject(fieldDef)) {
        return false;
    }

    if (isValueObjectClass(fieldDef)) {
        return false;
    }

    return fieldDef.optional === true;
}

export function isArrayField(
    field: SchemaField<any, any>,
): field is ArrayField<any> {
    return (
        typeof field === "object" && "array" in field && field.array === true
    );
}

export function isArrayOfObjects(
    field: ArrayField<any>,
): field is ArrayFieldObjects<ObjectSchema> {
    const item = field.item;

    if (isValueObjectClass(item)) {
        return false;
    }

    if (typeof item !== "object" || item === null) {
        return false;
    }

    return Object.values(item).every(
        (value) =>
            isValueObjectClass(value) ||
            (typeof value === "object" &&
                value !== null &&
                (("vo" in value && isValueObjectClass(value.vo)) ||
                    ("array" in value && value.array === true))),
    );
}

export function isObjectFieldOptional(
    fieldDef: SchemaField<any, any>,
): boolean {
    if (isSchemaObject(fieldDef)) {
        return false;
    }
    if (isValueObjectClass(fieldDef)) {
        return false;
    }
    if (isArrayField(fieldDef)) {
        return fieldDef.optional === true;
    }
    return fieldDef.optional === true;
}

import { isValueObjectClass } from "./type-guards";
import { ObjectSchema, SchemaField, ValueObjectClass } from "./types";

export function resolveField(fieldDef: SchemaField<any, any>): {
    vo?: ValueObjectClass<any>;
    config?: any;
    schema?: ObjectSchema;
} {
    if (isValueObjectClass(fieldDef)) {
        return { vo: fieldDef };
    }

    if (typeof fieldDef === "object" && "vo" in fieldDef) {
        return { vo: fieldDef.vo, config: fieldDef.config };
    }

    return {};
}

export function resolveObjectField(fieldDef: SchemaField<any, any>): {
    vo?: ValueObjectClass<any>;
    config?: any;
    schema?: ObjectSchema;
} {
    return resolveField(fieldDef);
}

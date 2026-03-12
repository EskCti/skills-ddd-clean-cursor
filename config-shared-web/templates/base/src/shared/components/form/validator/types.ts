export type VOResult<T> = {
    isFailure: boolean;
    isOk: boolean;
    errors?: string[];
    instance?: { value: T };
};

export type ValueObjectConfig = Record<string, any>;

export type ValueObjectClass<T, Config extends ValueObjectConfig = any> = {
    tryCreate(v: T, config?: Config): VOResult<any>;
};

export type FieldConfig<T, Config extends ValueObjectConfig = any> = {
    vo: ValueObjectClass<T, Config>;
    optional?: boolean;
    config?: Config;
};

export type ObjectSchema = {
    [key: string]: SchemaField<any, any>;
};

export type ArrayFieldVO<T, Config extends ValueObjectConfig = any> = {
    array: true;
    item: ValueObjectClass<T, Config>;
    optional?: boolean;
    min?: number;
    max?: number;
    config?: Config;
};

export type ArrayFieldObjects<T extends ObjectSchema> = {
    array: true;
    item: T;
    optional?: boolean;
    min?: number;
    max?: number;
};

export type ArrayField<T = any> =
    | ArrayFieldVO<T>
    | ArrayFieldObjects<ObjectSchema>;

export type SchemaField<T, Config extends ValueObjectConfig = any> =
    | ValueObjectClass<T, Config>
    | FieldConfig<T, Config>
    | ArrayField<T>
    | SchemaObject<any>;

export type GenericSchema =
    | ObjectSchema
    | SchemaObject<any>
    | ValueObjectClass<any>;

export type Schema = Record<string, SchemaField<any, any>>;

// NOTE: Helper para verificar se um campo e opcional
type IsOptionalConfig<T> =
    T extends FieldConfig<any, any>
        ? T extends { optional: true }
            ? true
            : false
        : false;

// NOTE: Extrai o tipo do valor de um campo (incluindo arrays aninhados)
type ExtractFieldValue<T> =
    T extends FieldConfig<infer V, any>
        ? Exclude<V, undefined>
        : T extends ValueObjectClass<infer V, any>
            ? Exclude<V, undefined>
            : T extends ArrayField<any>
                ? ExtractArrayType<T>
                : T extends SchemaObject<infer S>
                  ? Infer<S>
                  : never;

// NOTE: Extrai tipo de objeto schema com propriedades opcionais
export type ExtractObjectSchemaType<T extends ObjectSchema> = {
    [K in keyof T as IsOptionalConfig<T[K]> extends true
        ? never
        : K]: ExtractFieldValue<T[K]>;
} & {
    [K in keyof T as IsOptionalConfig<T[K]> extends true
        ? K
        : never]?: ExtractFieldValue<T[K]>;
};

export type ExtractArrayType<T extends ArrayField> =
    T extends ArrayFieldVO<infer V, any>
        ? Exclude<V, undefined>[]
        : T extends ArrayFieldObjects<infer S>
            ? S extends ObjectSchema
                ? ExtractObjectSchemaType<S>[]
                : never
            : never;

export type IsOptional<T extends SchemaField<any, any>> =
    T extends FieldConfig<any, any>
        ? T extends { optional: true }
            ? true
            : false
        : T extends ArrayField
            ? T extends { optional: true }
                ? true
                : false
            : false;

export type ExtractVOType<T extends SchemaField<any, any>> =
    T extends ArrayField
        ? ExtractArrayType<T>
        : T extends SchemaObject<infer S>
          ? Infer<S>
        : T extends ValueObjectClass<infer V, any>
            ? Exclude<V, undefined>
            : T extends FieldConfig<infer V, any>
                ? Exclude<V, undefined>
                : never;

export type Infer<T extends Schema> = {
    [K in keyof T]: IsOptional<T[K]> extends true
        ? ExtractVOType<T[K]> | undefined
        : ExtractVOType<T[K]>;
};

export type Refinement<T> = {
    check: (data: T) => boolean;
    message: string;
    field: string;
};

export interface SchemaObject<T extends Schema = Schema> {
    fields: T;
    _refinements: Refinement<Infer<T>>[];
    refine: (
        check: (data: Infer<T>) => boolean,
        config: { message: string; field: string },
    ) => SchemaObject<T>;
}

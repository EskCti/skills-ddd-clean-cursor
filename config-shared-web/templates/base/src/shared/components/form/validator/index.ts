import { Infer, Schema } from "./types";
import { Validator } from "./validator";

export const v = new Validator();

export namespace v {
    type ExtractSchema<T> = T extends { fields: infer F extends Schema }
        ? F
        : T extends Schema
          ? T
          : any;

    export type infer<T extends Schema | { fields: Schema }> = Infer<
        ExtractSchema<T>
    >;
}

export type {
    Schema,
    Infer,
    ObjectSchema,
    ArrayField,
    ArrayFieldVO,
    ArrayFieldObjects,
    FieldConfig,
    SchemaField,
    Refinement,
    SchemaObject,
} from "./types";

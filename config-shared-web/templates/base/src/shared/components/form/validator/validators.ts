import { ResolverResult } from 'react-hook-form';
import { getErrorMessage, getMessage } from '../../../i18n';
import {
  ArrayField,
  ArrayFieldVO,
  Infer,
  ObjectSchema,
  Refinement,
  Schema,
  SchemaField,
  SchemaObject,
  VOResult,
} from './types';
import {
  formatInvalidTypeError,
  formatMaxError,
  formatMinError,
  formatRequiredError,
  refinementValidationError,
  formatValidationError,
} from './error-helpers';
import { resolveField } from './field-resolvers';
import {
  isArrayField,
  isArrayOfObjects,
  isEmptyValue,
  isObjectSchema,
  isSchemaObject,
  isValueObjectClass,
} from './type-guards';

export interface ValidationContext {
  errors: Record<string, any>;
  processedValues: Record<string, any>;
}

export function validateSimpleField(
  vo: { tryCreate(v: unknown, config?: any): VOResult<any> },
  fieldValue: unknown,
  config: any,
  context: ValidationContext,
  fieldName: string,
): boolean {
  const result = vo.tryCreate(fieldValue, config);

  if (result?.isFailure) {
    context.errors[fieldName] = formatValidationError(result.errors);
    return false;
  }

  if (result?.isOk) {
    context.processedValues[fieldName] = result.instance?.value ?? fieldValue;
  }

  return true;
}

export function validateArray(
  fieldDef: ArrayField<any>,
  fieldValue: unknown,
  context: ValidationContext,
  fieldName: string,
): boolean {
  if (!Array.isArray(fieldValue)) {
    context.errors[fieldName] = formatInvalidTypeError(getMessage('INVALID_ARRAY'));
    return false;
  }

  if (typeof fieldDef.min === 'number' && fieldValue.length < fieldDef.min) {
    context.errors[fieldName] = formatMinError(fieldDef.min);
    return false;
  }

  if (typeof fieldDef.max === 'number' && fieldValue.length > fieldDef.max) {
    context.errors[fieldName] = formatMaxError(fieldDef.max);
    return false;
  }

  return true;
}

function validateObjectSchema(
  schema: ObjectSchema,
  value: unknown,
  context: ValidationContext,
  path: string,
  refinements?: Refinement<any>[],
): { isValid: boolean; processedValue?: Record<string, any> } {
  if (typeof value !== 'object' || value === null) {
    context.errors[path] = formatInvalidTypeError(getMessage('INVALID_OBJECT'));
    return { isValid: false };
  }

  const errors: Record<string, any> = {};
  const processedValue: Record<string, any> = {};
  let hasErrors = false;

  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    const fieldValue = (value as Record<string, unknown>)[fieldName];
    const fieldPath = path ? `${path}.${fieldName}` : fieldName;

    if (isEmptyValue(fieldValue)) {
      const isOptional =
        typeof fieldDef === 'object' &&
        !isValueObjectClass(fieldDef) &&
        'optional' in fieldDef &&
        fieldDef.optional === true;

      if (!isOptional) {
        errors[fieldName] = formatRequiredError();
        hasErrors = true;
      }
      continue;
    }

    const result = validateField(fieldDef, fieldValue, context, fieldPath);

    if (result) {
      if (context.processedValues[fieldPath] !== undefined) {
        processedValue[fieldName] = context.processedValues[fieldPath];
        delete context.processedValues[fieldPath];
      } else {
        processedValue[fieldName] = fieldValue;
      }
    } else {
      const error = context.errors[fieldPath];
      if (error !== undefined) {
        errors[fieldName] = error;
        delete context.errors[fieldPath];
        hasErrors = true;
      }
    }
  }

  if (refinements && refinements.length > 0) {
    for (const refinement of refinements) {
      const isValidRefinement = refinement.check(processedValue);
      if (!isValidRefinement) {
        errors[refinement.field] = refinementValidationError(refinement.message);
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    context.errors[path] = errors;
    return { isValid: false };
  }

  return { isValid: true, processedValue };
}

export function validateField(
  fieldDef: SchemaField<any, any>,
  fieldValue: unknown,
  context: ValidationContext,
  fieldName: string,
): boolean {
  if (isEmptyValue(fieldValue)) {
    const isOptional =
      typeof fieldDef === 'object' &&
      !isValueObjectClass(fieldDef) &&
      'optional' in fieldDef &&
      fieldDef.optional === true;
    return isOptional;
  }

  // NOTE: lida com campos de um array
  if (isArrayField(fieldDef)) {
    const isValid = validateArray(fieldDef, fieldValue, context, fieldName);
    if (!isValid) return false;

    return validateArrayItems(fieldDef, fieldValue as unknown[], context, fieldName);
  }

  // NOTE: lida com VO e FieldConfig
  const { vo, config } = resolveField(fieldDef);
  if (vo) {
    return validateSimpleField(vo, fieldValue, config, context, fieldName);
  }

  // NOTE: lida com objetos simples/aninhados
  if (isObjectSchema(fieldDef)) {
    const result = validateObjectSchema(fieldDef, fieldValue, context, fieldName);
    if (result.isValid && result.processedValue) {
      context.processedValues[fieldName] = result.processedValue;
    }
    return result.isValid;
  }

  // NOTE: lida com SchemaObject definido via v.defineObject(...)
  if (isSchemaObject(fieldDef)) {
    const schemaObject = fieldDef as SchemaObject<any>;
    const result = validateObjectSchema(schemaObject.fields, fieldValue, context, fieldName, schemaObject._refinements);

    if (result.isValid && result.processedValue) {
      context.processedValues[fieldName] = result.processedValue;
    }
    return result.isValid;
  }

  return false;
}

export function validateArrayItems(
  fieldDef: ArrayField<any>,
  fieldValue: unknown[],
  context: ValidationContext,
  fieldName: string,
): boolean {
  const itemDef = fieldDef.item;
  const isObjectArray = isArrayOfObjects(fieldDef);
  const itemErrors: Array<Record<string, any> | undefined> = [];
  let hasItemErrors = false;
  const processedArray: any[] = [];

  for (let index = 0; index < fieldValue.length; index++) {
    const item = fieldValue[index];
    const itemPath = `${fieldName}[${index}]`;

    if (isObjectArray) {
      // NOTE: Valida objeto de schema
      const schema = itemDef as ObjectSchema;
      const result = validateObjectSchema(schema, item, context, itemPath);

      if (result.isValid && result.processedValue) {
        processedArray.push(result.processedValue);
      } else {
        hasItemErrors = true;
        itemErrors[index] = context.errors[itemPath];
        delete context.errors[itemPath];
      }
    } else {
      // NOTE: Valida VO
      const voItem = itemDef as ArrayFieldVO<any, any>['item'];
      const voConfig = (fieldDef as ArrayFieldVO<any, any>).config;
      const result = voItem.tryCreate(item, voConfig);

      if (result.isFailure) {
        hasItemErrors = true;
        itemErrors[index] = {
          type: 'validation',
          message: getErrorMessage({ errors: result.errors }) || getMessage('INVALID_ITEM'),
        };
      } else {
        processedArray.push(result.instance?.value ?? item);
      }
    }
  }

  if (hasItemErrors) {
    context.errors[fieldName] = itemErrors;
    return false;
  }

  context.processedValues[fieldName] = processedArray;
  return true;
}

export function createValidationResult<T extends Schema>(context: ValidationContext): ResolverResult<Infer<T>> {
  const hasErrors = Object.keys(context.errors).length > 0;

  if (hasErrors) {
    return {
      errors: context.errors,
      values: {} as Record<string, never>,
    };
  }

  return {
    errors: {},
    values: context.processedValues as Infer<T>,
  };
}

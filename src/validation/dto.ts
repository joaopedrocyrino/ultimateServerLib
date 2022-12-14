export type IValidationFieldType = 'string' | 'guid' | 'bool' | 'number' | 'timestamp' | 'custom' | 'array' | 'email'

export interface IValidationFieldOptions {
    required?: boolean
    items?: IValidationSchema | IValidationField
    positive?: boolean
    negative?: boolean
    max?: number
    min?: number
    length?: number
    int?: boolean
    valid?: any[]
    custom?: (value: any) => boolean
}

export type IValidationField = IValidationFieldType | [IValidationFieldType, IValidationFieldOptions]

export interface IValidationSchemaOptions {
    or?: string[]
}

export type IValidationSchemaType = { [k: string]: IValidationField }

export type IValidationSchema = [IValidationSchemaType, IValidationSchemaOptions] | IValidationSchemaType

export type IValidationSchemas = { [k: string]: IValidationSchema }

import Joi from 'joi'

import { ValidationError } from '../errors'
import {
    IValidationField,
    IValidationSchemas,
    IValidationSchemaType,
    IValidationSchemaOptions,
    IValidationFieldType,
    IValidationFieldOptions,
    IValidationSchema
} from './dto'

class Validator {
    private readonly joiObjects: { [k: string]: Joi.ObjectSchema }

    constructor(private readonly schemas: IValidationSchemas) {
        const joiObjects = this.transformSchemas(schemas)
        this.joiObjects = joiObjects
    }

    private transformSchemas(schemas: IValidationSchemas): { [k: string]: Joi.ObjectSchema } {
        const joiObjects: { [k: string]: Joi.ObjectSchema } = {}

        Object.keys(this.schemas).forEach((k) => {
            const schema = schemas[k]
            let fields: IValidationSchemaType
            let schemaOpts: IValidationSchemaOptions | undefined

            if (Array.isArray(schema)) {
                fields = schema[0]
                schemaOpts = schema[1]
            } else {
                fields = schema
            }

            const joiObj: { [k: string]: Joi.AnySchema } = {}

            Object.keys(fields).forEach(field => {
                joiObj[field] = this.fieldToJoi(fields[field])
            })

            joiObjects[k] = Joi.object(joiObj)

            if (schemaOpts?.or) {
                joiObjects[k] = joiObjects[k].or(...schemaOpts.or)
            }
        })

        return joiObjects
    }

    private fieldToJoi(f: IValidationField): Joi.Schema {
        let field: IValidationFieldType
        let opts: IValidationFieldOptions | undefined

        if (Array.isArray(f)) {
            field = f[0]
            opts = f[1]
        } else {
            field = f
        }

        let fieldSchema
        // const opts = f[1]

        switch (field) {
            case 'string':
                fieldSchema = Joi.string()

                if (opts?.length) {
                    fieldSchema = fieldSchema.length(opts.length)
                } else {
                    if (opts?.max) { fieldSchema = fieldSchema.max(opts.max) }

                    if (opts?.min) { fieldSchema = fieldSchema.min(opts.min) }
                }

                break

            case 'guid':
                fieldSchema = Joi.string().guid()

                break

            case 'bool':
                fieldSchema = Joi.boolean()

                break

            case 'number':
                fieldSchema = Joi.number()

                if (opts?.int) { fieldSchema = fieldSchema.integer() }
                if (opts?.max) { fieldSchema = fieldSchema.max(opts.max) }
                if (opts?.min) { fieldSchema = fieldSchema.min(opts.min) }
                if (opts?.positive) { fieldSchema = fieldSchema.positive() }
                else if (opts?.negative) { fieldSchema = fieldSchema.negative() }

                break

            case 'timestamp':
                fieldSchema = Joi.date().iso()

                break

            case 'email':
                fieldSchema = Joi.string().email()
                break

            case 'array':
                const items = opts?.items

                let item: Joi.Schema

                if (items && typeof items[0] === 'string') {
                    item = this.fieldToJoi(items as IValidationField)
                } else {
                    const { i } = this.transformSchemas({ i: items as IValidationSchema ?? [{}] })

                    item = i
                }

                fieldSchema = Joi.array().items(item)
                break

            default:
                fieldSchema = Joi.custom((value, helper) => {
                    const custom = opts
                        ? opts.custom
                        : undefined

                    const isValid = custom
                        ? custom(value)
                        : false

                    if (isValid) {
                        return true
                    } else { return helper.error(`invalid custom value: ${value}`) }
                })
        }

        if (opts?.valid) {
            fieldSchema.valid(...opts.valid)
        }

        if (opts?.required) {
            fieldSchema.required()
        }

        return fieldSchema
    }

    validate(schemaKey: string, body: { [k: string]: any }): void {
        const joiObj = this.joiObjects[schemaKey]

        if (joiObj) {
            const { error } = joiObj.validate(body)
            if (error) { throw new ValidationError(error.message) }
        }
    }
}

export default Validator

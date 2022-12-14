import {
  IValidationFieldOptions,
  IValidationFieldType,
  IValidationSchema,
  IValidationSchemaType,
} from './dto';
import Validator from './validator';

class ValidationCRUD extends Validator {
  constructor(
    crud: [IValidationSchemaType, string[]] | IValidationSchemaType,
    others?: { [k: string]: IValidationSchema }
  ) {
    const createdAt: IValidationFieldType = 'timestamp';
    const updatedAt: IValidationFieldType = 'timestamp';
    const isDeleted: IValidationFieldType = 'bool';

    const create: IValidationSchemaType = {};
    const update: IValidationSchemaType = {};

    let schema: IValidationSchemaType
    const notUpdatableFields: string[] = []

    if (Array.isArray(crud)) {
        schema = crud[0]
        notUpdatableFields.push(...crud[1])
    } else {
        schema = crud
    }

    Object.keys(schema).forEach(k => {
      create[k] = schema[k]

      if (!notUpdatableFields.includes(k)) {

        let opts: IValidationFieldOptions | undefined = undefined

        if (Array.isArray(schema[k])) {
          const fieldOpts = schema[k][1] as IValidationFieldOptions

          if (fieldOpts) {
            const { required, ...rest } = fieldOpts

            opts = rest
          }
        }

        update[k] = opts ? [schema[k][0] as IValidationFieldType, opts] : schema[k]
      }
    })

    const updateOr = [...Object.keys(update)];

    const getOr = [...updateOr, 'createdAt', 'updatedAt', 'isDeleted'];

    const getOne: IValidationSchemaType = {
      createdAt,
      updatedAt,
      isDeleted,
      ...update,
    };

    super({
      create,
      getOne: [getOne, { or: getOr }],
      getMany: {
        fields: ['array', { items: getOne }],
        take: ['number', { positive: true, int: true }],
        skip: ['number', { positive: true, int: true }],
        order: ['string', { valid: getOr }],
        direction: ['string', { valid: ['ASC', 'DESC'] }],
        group: ['array', { items: ['string', { valid: getOr }] }],
      },
      update: [
        {
        //   id: [id, { required: true }],
          ...update,
        },
        { or: updateOr },
      ],
      // delete: [{ id: [id, { required: true }] }],
      ...(others ?? {}),
    });
  }
}

export default ValidationCRUD;

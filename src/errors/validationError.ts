import AppError from './appError'

export class ValidationError extends AppError {
    constructor(message?: string) {
        super({
            message,
            code: 400,
            layer: 'Validation'
        })
    }
}

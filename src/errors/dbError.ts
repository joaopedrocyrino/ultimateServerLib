import AppError from './appError'

export class DatabaseError extends AppError {
    constructor(message?: string) {
        super({
            message,
            code: 500,
            layer: 'Database'
        })
    }
}

export class DatabaseNotFoundError extends AppError {
    constructor (message?: string) {
        super({
            message,
            code: 404,
            layer: 'Database'
        })
    }
}

export class DatabaseConflictError extends AppError {
    constructor (message?: string) {
        super({
            message,
            code: 409,
            layer: 'Database'
        })
    }
}

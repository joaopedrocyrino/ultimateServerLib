import AppError from './appError'

class DatabaseError extends AppError {
    constructor(message?: string) {
        super({
            message,
            code: 'DatabaseError'
        })
    }
}

export default DatabaseError

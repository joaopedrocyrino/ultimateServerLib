import { IAppError } from './dto'

class AppError extends Error {
    readonly code?: number
    readonly layer?: string

    constructor({ message, ...props }: IAppError) {
        super(message)

        Object.assign(this, props)
    }
}

export default AppError

import { IAppError } from './dto'

class AppError extends Error {
    readonly code?: string

    constructor({ message, ...props }: IAppError) {
        super(message)

        Object.assign(this, props)
    }
}

export default AppError

import { ZodError } from 'zod';

export function formatZodErrors(error: ZodError) {
    return error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
    }));
}

export class ApiError extends Error {
    statusCode: number;
    errors?: any;

    constructor(
        statusCode: number,
        message: string,
        errors?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;


        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static badRequest(message: string, errors?: any) {
        return new ApiError(400, message, errors);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message: string = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message: string = 'Not Found') {
        return new ApiError(404, message);
    }

    static internalServer(message: string = 'Internal Server Error') {
        return new ApiError(500, message);
    }
}
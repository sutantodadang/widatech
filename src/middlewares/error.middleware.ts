import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): any => {

    console.error('Global Error Handler:', err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.statusCode,
            message: err.message,
            errors: err.errors || null
        });
    }

    res.status(500).json({
        success: false,
        status: 500,
        message: 'An unexpected error occurred',
        errors: process.env.NODE_ENV === 'development'
            ? {
                name: err.name,
                message: err.message,
                stack: err.stack
            }
            : null
    });

};
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { formatZodErrors, ApiError } from '../utils/errors';


export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {

            let dataToValidate;
            switch (req.method) {
                case 'POST':
                case 'PUT':
                    dataToValidate = req.body;
                    break;
                case 'GET':
                    dataToValidate = req.query;
                    break;
                case 'DELETE':
                    dataToValidate = req.params;
                    break;
                default:
                    return next();
            }

            schema.parse(dataToValidate);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodErrors(error);

                next(ApiError.badRequest(
                    'Validation failed',
                    formattedErrors
                ));
            } else {
                next(error);
            }
        }
    };
};
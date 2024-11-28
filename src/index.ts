import express from 'express';
import { AppDataSource } from './data-source';
import invoiceRoutes from './routes';
import { globalErrorHandler } from './middlewares/error.middleware';
import { ApiError } from './utils/errors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;


AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        app.use(express.json());
        app.use(morgan("dev"))

        app.use('/api', invoiceRoutes);
        app.use('*', (req, res, next) => {
            next(ApiError.notFound('Endpoint not found'));
        });


        app.use(globalErrorHandler);


        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
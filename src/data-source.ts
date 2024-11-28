import "reflect-metadata";
import { DataSource } from "typeorm";
import { Invoice } from "./entities/invoice.entity";
import { Product } from "./entities/product.entity";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'widatech',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [Invoice, Product],
    migrations: [],
    subscribers: [],
});
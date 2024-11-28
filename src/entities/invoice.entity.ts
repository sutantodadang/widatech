import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    CreateDateColumn
} from "typeorm";
import { Product } from "./product.entity";

@Entity('invoices')
export class Invoice {
    @PrimaryColumn({ type: 'text', name: 'invoice_no' })
    invoiceNo: string;

    @CreateDateColumn({ name: 'invoice_date' })
    date: Date;

    @Column({ type: 'text', name: 'customer_name' })
    customerName: string;

    @Column({ type: 'text', name: 'sales_person_name' })
    salesPersonName: string;

    @Column({
        type: 'enum',
        enum: ['CASH', 'CREDIT'],
        name: 'payment_type'
    })
    paymentType: 'CASH' | 'CREDIT';

    @Column({
        type: 'text',
        name: 'notes',
        nullable: true
    })
    notes?: string;

    @OneToMany(() => Product, product => product.invoice, {
        cascade: true,
        eager: true
    })
    products: Product[];

    @Column({
        type: 'numeric',
        name: 'total_profit',
        nullable: true
    })
    totalProfit?: number;
}
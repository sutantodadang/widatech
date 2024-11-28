import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Invoice } from "./invoice.entity";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', name: 'item_name' })
    itemName: string;

    @Column({ type: 'integer' })
    quantity: number;

    @Column({
        type: 'numeric',
        name: 'total_cost_of_goods_sold'
    })
    totalCostOfGoodsSold: number;

    @Column({
        type: 'numeric',
        name: 'total_price_sold'
    })
    totalPriceSold: number;

    @ManyToOne(() => Invoice, invoice => invoice.products, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'invoice_no', referencedColumnName: 'invoiceNo' })
    invoice: Invoice;
}
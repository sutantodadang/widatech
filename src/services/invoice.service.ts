import { AppDataSource } from '../data-source';
import { Invoice } from '../entities/invoice.entity';
import { Product } from '../entities/product.entity';
import { Between, Repository } from 'typeorm';
import { formatDate, keysToCamelCase, parseDate } from '../utils/excel';
import { ExcelInvoiceSchema, ExcelProductSchema, ResponseFind } from '../models/invoice.model';
import { ApiError } from '../utils/errors';

export interface IInvoiceService {
    createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice>
    findInvoices(
        date: string,
        size: number,
        page: number
    ): Promise<ResponseFind>
    updateInvoice(invoiceData: Partial<Invoice>): Promise<Invoice>
    deleteInvoice(invoiceNo: string): Promise<void>
    processExcel(invoiceSheet: any[], productSheet: any[]): Promise<number>

}

export class InvoiceService implements IInvoiceService {
    private invoiceRepository: Repository<Invoice>;
    private productRepository: Repository<Product>;

    constructor() {
        this.invoiceRepository = AppDataSource.getRepository(Invoice);
        this.productRepository = AppDataSource.getRepository(Product);
    }


    async processExcel(invoiceSheet: any[], productSheet: any[]): Promise<number> {

        const validationErrors: {
            invoiceNo: string,
            errors: string[]
        }[] = [];
        const validInvoices: any[] = [];
        const validProducts: any[] = [];


        const invoiceNos = new Set<string>();


        // Validate invoices
        invoiceSheet.forEach((invoice: any) => {


            invoice = keysToCamelCase(invoice)

            let paymentType = invoice.paymentType;
            if (paymentType !== 'CASH' && paymentType !== 'CREDIT') {
                paymentType = 'CASH';
            }

            let invFormatDate = formatDate(invoice.date)


            const invoiceValidation = ExcelInvoiceSchema.safeParse({
                ...invoice,
                date: parseDate(invFormatDate),
                paymentType: paymentType,
                invoiceNo: String(invoice.invoiceNo),
                customerName: invoice.customer,
                salesPersonName: invoice.salesperson,
            });


            if (!invoiceValidation.success) {
                validationErrors.push({
                    invoiceNo: invoice.invoiceNo,
                    errors: invoiceValidation.error.errors.map(err => err.path + " | " + err.message)
                });
            } else {

                if (invoiceNos.has(invoice.invoiceNo)) {
                    validationErrors.push({
                        invoiceNo: invoice.invoiceNo,
                        errors: ["Duplicate invoice number"]
                    });
                } else {
                    invoiceNos.add(invoice.invoiceNo);
                    validInvoices.push(invoiceValidation.data);
                }
            }
        });

        // Validate products
        productSheet.forEach((product: any) => {


            product = keysToCamelCase(product)

            const productValidation = ExcelProductSchema.safeParse({
                ...product,
                invoiceNo: String(product.invoiceNo),
                quantity: Number(product.quantity),
                totalCostOfGoodsSold: Number(product.totalCogs),
                totalPriceSold: Number(product.totalPrice),
                itemName: product.item
            });



            if (!productValidation.success) {

                const existingError = validationErrors.find(
                    error => error.invoiceNo === product.invoiceNo
                );

                if (!existingError) {
                    validationErrors.push({
                        invoiceNo: product.invoiceNo,
                        errors: productValidation.error.errors.map(err => err.path + " | " + err.message)
                    });
                }
            } else {

                const invoiceExists = validInvoices.some(
                    invoice => String(invoice.invoiceNo) === String(product.invoiceNo)
                );

                if (!invoiceExists) {
                    validationErrors.push({
                        invoiceNo: product.invoiceNo,
                        errors: ["Product invoice number does not match any valid invoice"]
                    });
                } else {
                    validProducts.push(productValidation.data);
                }
            }
        });

        if (validationErrors.length > 0) {
            throw new ApiError(400, "Validation errors in invoice import", validationErrors)

        }


        const processedInvoices = validInvoices.map<Invoice>(invoice => {

            const invoiceProducts = validProducts.filter(
                product => product.invoiceNo === invoice.invoiceNo
            );

            return {
                ...invoice,
                products: invoiceProducts
            };
        });

        const savedInvoices = await Promise.all(
            processedInvoices.map(invoice =>
                this.createInvoice(invoice)
            )
        );

        return savedInvoices.length
    }

    async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {

        const totalProfit = invoiceData.products.reduce((acc, product) =>
            acc + (product.totalPriceSold - product.totalCostOfGoodsSold), 0);

        const invoice = this.invoiceRepository.create({
            ...invoiceData,
            totalProfit
        });

        return this.invoiceRepository.save(invoice);
    }

    async findInvoices(
        date: string,
        size: number = 10,
        page: number = 1
    ): Promise<ResponseFind> {
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const [invoices, total] = await this.invoiceRepository.findAndCount({
            where: {
                date: Between(startDate, endDate)
            },
            take: size,
            skip: (page - 1) * size
        });

        const totalProfit = invoices.reduce((sum, invoice) =>
            sum + (invoice.totalProfit || 0), 0);

        const cashTransactionsTotal = invoices
            .filter(inv => inv.paymentType === 'CASH')
            .reduce((sum, invoice) =>
                sum + invoice.products.reduce((pSum, product) =>
                    pSum + Number(product.totalPriceSold), 0), 0);


        return {
            invoices,
            totalProfit: Number(totalProfit),
            cashTransactionsTotal: Number(cashTransactionsTotal)
        };
    }

    async updateInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
        const existingInvoice = await this.invoiceRepository.findOne({
            where: { invoiceNo: invoiceData.invoiceNo }
        });

        if (!existingInvoice) {
            throw new Error('Invoice not found');
        }


        const totalProfit = invoiceData.products.reduce((acc, product) =>
            acc + (product.totalPriceSold - product.totalCostOfGoodsSold), 0);


        const updatedInvoice = this.invoiceRepository.merge(existingInvoice, {
            ...invoiceData,
            totalProfit
        });

        return this.invoiceRepository.save(updatedInvoice);
    }

    async deleteInvoice(invoiceNo: string): Promise<void> {
        await this.invoiceRepository.delete({ invoiceNo });
    }
}
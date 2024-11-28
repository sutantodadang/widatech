import { z } from "zod";

export const PaymentTypeEnum = z.enum(["CASH", "CREDIT"]);

export const ProductSchema = z.object({
    itemName: z
        .string()
        .min(5, { message: "Item name must be at least 5 characters long" }),
    quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
    totalCostOfGoodsSold: z
        .number()
        .nonnegative({ message: "Total cost must be non-negative" }),
    totalPriceSold: z
        .number()
        .nonnegative({ message: "Total price must be non-negative" }),
});

export const InvoiceSchema = z.object({
    invoiceNo: z.string().min(1, { message: "Invoice number is required" }),
    date: z
        .date()
        .or(z.string().datetime())
        .refine(
            (val) => {
                const date = val instanceof Date ? val : new Date(val);
                return !isNaN(date.getTime());
            },
            { message: "Invalid date format" }
        ),
    customerName: z
        .string()
        .min(2, { message: "Customer name must be at least 2 characters long" }),
    salesPersonName: z
        .string()
        .min(2, { message: "Salesperson name must be at least 2 characters long" }),
    paymentType: PaymentTypeEnum,
    notes: z
        .string()
        .min(5, { message: "Notes must be at least 5 characters long" })
        .optional(),
    products: z
        .array(ProductSchema)
        .min(1, { message: "At least one product is required" }),
});

export const InvoiceQuerySchema = z.object({
    date: z.string().datetime(),
    size: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0, {
            message: "Page size must be a positive number",
        }),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, {
            message: "Page number must be a positive number",
        }),
});

export interface ResponseFind {
    invoices: any;
    totalProfit: number;
    cashTransactionsTotal: number;
}

export const ExcelInvoiceSchema = z.object({
    invoiceNo: z.string().min(1, "Invoice number is required"),
    date: z.date({
        required_error: "Date is required",
        invalid_type_error: "Invalid date format",
    }),
    customerName: z.string().min(1, "Customer is required"),
    salesPersonName: z.string().min(1, "Salesperson is required"),
    paymentType: z.enum(["CASH", "CREDIT"], {
        errorMap: () => ({ message: "Payment type must be either CASH or CREDIT" }),
    }),
    notes: z.string().optional(),
});

export const ExcelProductSchema = z.object({
    invoiceNo: z.string().min(1, "Invoice number is required"),
    itemName: z.string().min(1, "Item name is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    totalCostOfGoodsSold: z
        .number()
        .positive("Total COGS must be a positive number"),
    totalPriceSold: z.number().positive("Total price must be a positive number"),
});

import { Request, Response } from "express";
import { IInvoiceService } from "../services/invoice.service";
import * as XLSX from "xlsx";

export class InvoiceController {
    private _invoiceService: IInvoiceService;
    constructor(invoiceService: IInvoiceService) {
        this._invoiceService = invoiceService;
        this.createInvoice = this.createInvoice.bind(this);
        this.readInvoices = this.readInvoices.bind(this);
        this.updateInvoice = this.updateInvoice.bind(this);
        this.deleteInvoice = this.deleteInvoice.bind(this);
        this.importInvoices = this.importInvoices.bind(this);
    }

    async createInvoice(req: Request, res: Response) {
        try {
            const invoiceData = req.body;

            const invoice = await this._invoiceService.createInvoice(invoiceData);
            res.status(201).json({ message: "success", data: invoice });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error creating invoice", error: error.message });
        }
    }

    async readInvoices(req: Request, res: Response) {
        try {
            const { date, size = 10, page = 1 } = req.query;
            const result = await this._invoiceService.findInvoices(
                date as string,
                Number(size),
                Number(page)
            );


            res.json({ message: "success", data: result });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error fetching invoices", error: error.message });
        }
    }

    async updateInvoice(req: Request, res: Response) {
        try {
            const invoiceData = req.body;

            const updatedInvoice = await this._invoiceService.updateInvoice(
                invoiceData
            );
            res.json({ message: "success", data: updatedInvoice });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error updating invoice", error: error.message });
        }
    }

    async deleteInvoice(req: Request, res: Response) {
        try {
            const { invoiceNo } = req.params;
            await this._invoiceService.deleteInvoice(invoiceNo);
            res.json({ message: "Invoice deleted successfully" });
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error deleting invoice", error: error.message });
        }
    }

    async importInvoices(req: Request, res: Response) {
        console.log(req.file);
        try {
            if (!req.file) {
                res.status(400).json({ message: "No file uploaded" });
            }

            const workbook = XLSX.readFile(req.file.path);

            const invoiceSheet = XLSX.utils.sheet_to_json(workbook.Sheets["invoice"]);
            const productSheet = XLSX.utils.sheet_to_json(
                workbook.Sheets["product sold"]
            );

            const result = await this._invoiceService.processExcel(
                invoiceSheet,
                productSheet
            );

            res.status(201).json({
                message: "success import invoice",
                importedCount: result,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error importing invoices",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

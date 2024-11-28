import express from 'express';
import { z } from "zod";
import multer from 'multer';
import { InvoiceController } from './controllers/invoice.controller';
import { validateRequest } from './middlewares/validation.middleware';
import { InvoiceSchema, InvoiceQuerySchema } from './models/invoice.model';
import { InvoiceService } from './services/invoice.service';


const upload = multer({
    dest: 'uploads/',

});

const router = express.Router();
const Iservice = new InvoiceService()
const Icontroller = new InvoiceController(Iservice)

router.post('/invoices', validateRequest(InvoiceSchema), Icontroller.createInvoice);
router.get('/invoices', validateRequest(InvoiceQuerySchema), Icontroller.readInvoices);
router.put('/invoices', validateRequest(InvoiceSchema), Icontroller.updateInvoice);
router.delete('/invoices/:invoiceNo', validateRequest(z.object({
    invoiceNo: z.string().min(1, { message: "Invoice number is required" })
})), Icontroller.deleteInvoice);
router.post('/invoices/import', upload.single("file_excel"), Icontroller.importInvoices);

export default router;
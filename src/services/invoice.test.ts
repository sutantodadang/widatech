import { InvoiceService } from './invoice.service';
import { AppDataSource } from '../data-source';
import { Invoice } from '../entities/invoice.entity';
import { ApiError } from '../utils/errors';

jest.mock('../data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

describe('InvoiceService', () => {
    let invoiceService: InvoiceService;
    let mockInvoiceRepository: {
        create: jest.Mock;
        save: jest.Mock;
        findOne: jest.Mock;
        findAndCount: jest.Mock;
        merge: jest.Mock;
        delete: jest.Mock;
    };

    beforeEach(() => {

        mockInvoiceRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn()
        };

        (AppDataSource.getRepository as jest.Mock)
            .mockImplementationOnce(() => mockInvoiceRepository)
            .mockImplementationOnce(() => ({}));

        invoiceService = new InvoiceService();
    });

    describe('createInvoice', () => {
        it('should create an invoice with total profit', async () => {
            const invoiceData = {
                invoiceNo: '123',
                products: [
                    { totalPriceSold: 100, totalCostOfGoodsSold: 60 },
                    { totalPriceSold: 200, totalCostOfGoodsSold: 120 }
                ]
            };

            const expectedInvoice = {
                ...invoiceData,
                totalProfit: 120
            };

            mockInvoiceRepository.create.mockReturnValue(expectedInvoice);
            mockInvoiceRepository.save.mockResolvedValue(expectedInvoice);

            const result = await invoiceService.createInvoice(invoiceData as any);

            expect(mockInvoiceRepository.create).toHaveBeenCalledWith({
                ...invoiceData,
                totalProfit: 120
            });
            expect(mockInvoiceRepository.save).toHaveBeenCalledWith(expectedInvoice);
            expect(result).toEqual(expectedInvoice);
        });
    });

    describe('processExcel', () => {
        it('should process valid invoice and product sheets', async () => {
            const invoiceSheet = [
                {
                    invoiceNo: '123',
                    date: '05/01/2021',
                    customer: 'John Doe',
                    salesperson: 'Jane Smith',
                    paymentType: 'CASH',
                    notes: 'this notes'
                }
            ];

            const productSheet = [
                {
                    invoiceNo: '123',
                    item: 'Product A',
                    quantity: 2,
                    totalCogs: 100,
                    totalPrice: 200
                }
            ];


            jest.spyOn(invoiceService, 'createInvoice').mockResolvedValue({} as Invoice);

            const result = await invoiceService.processExcel(invoiceSheet, productSheet);

            expect(result).toBe(1);
        });

        it('should throw ApiError for invalid invoice data', async () => {
            const invalidInvoiceSheet = [
                {
                    invoiceNo: '123',
                    date: 'invalid-date',
                    customer: ''
                }
            ];

            const productSheet = [];

            await expect(invoiceService.processExcel(invalidInvoiceSheet, productSheet))
                .rejects.toThrow(ApiError);
        });
    });

    describe('findInvoices', () => {
        it('should find invoices for a specific date', async () => {
            const mockInvoices = [
                {
                    invoiceNo: '123',
                    totalProfit: 100,
                    paymentType: 'CASH',
                    products: [{ totalPriceSold: 200 }]
                }
            ];

            mockInvoiceRepository.findAndCount.mockResolvedValue([mockInvoices, 1]);

            const result = await invoiceService.findInvoices('2023-01-01');

            expect(result.invoices).toEqual(mockInvoices);
            expect(result.totalProfit).toBe(100);
            expect(result.cashTransactionsTotal).toBe(200);
        });
    });

    describe('updateInvoice', () => {
        it('should update an existing invoice', async () => {
            const existingInvoice = {
                invoiceNo: '123',
                products: []
            };

            const updatedInvoiceData = {
                invoiceNo: '123',
                products: [
                    { totalPriceSold: 100, totalCostOfGoodsSold: 60 }
                ]
            };

            mockInvoiceRepository.findOne.mockResolvedValue(existingInvoice);
            mockInvoiceRepository.merge.mockReturnValue({
                ...existingInvoice,
                ...updatedInvoiceData,
                totalProfit: 40
            });
            mockInvoiceRepository.save.mockResolvedValue({} as Invoice);

            const result = await invoiceService.updateInvoice(updatedInvoiceData as any);

            expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
                where: { invoiceNo: '123' }
            });
            expect(mockInvoiceRepository.merge).toHaveBeenCalled();
            expect(mockInvoiceRepository.save).toHaveBeenCalled();
        });

        it('should throw error if invoice not found', async () => {
            mockInvoiceRepository.findOne.mockResolvedValue(null);

            await expect(invoiceService.updateInvoice({ invoiceNo: '123' } as any))
                .rejects.toThrow('Invoice not found');
        });
    });

    describe('deleteInvoice', () => {
        it('should delete an invoice', async () => {
            mockInvoiceRepository.delete.mockResolvedValue(undefined);

            await invoiceService.deleteInvoice('123');

            expect(mockInvoiceRepository.delete).toHaveBeenCalledWith({ invoiceNo: '123' });
        });
    });
});
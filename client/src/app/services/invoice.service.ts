import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Invoice } from '../models/invoice';
import { CartItem } from '../models/cart-item';
import { deliveryData } from '../models/delivery-data.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private databaseService: DatabaseService) { }
  async createInvoice(
    cartItems: CartItem[],
    deliveryData: deliveryData,
    totalAmount: number,
    shippingCost: number,
    paymentMethod: string
  ): Promise<string> {
    const orderNumber = this.generateOrderNumber();

    const invoice: Omit<Invoice, 'id'> = {
      orderNumber,
      customerName: `${deliveryData.name} ${deliveryData.surname}`,
      customerEmail: deliveryData.email,
      customerPhone: deliveryData.phone,
      deliveryAddress: `${deliveryData.adress}, ${deliveryData.city}, ${deliveryData.zipCode}, ${deliveryData.country}`,
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice
      })),
      totalAmount,
      shippingCost,
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.databaseService.addInvoice(invoice);
  }

  getInvoices() {
    return this.databaseService.getInvoices();
  }

  async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<void> {
    const invoice = { status, updatedAt: new Date() };
    await this.databaseService.updateInvoice(id, invoice);
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.databaseService.deleteInvoice(id);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  exportToExcel(invoices: Invoice[]): void {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(
        invoices.map(invoice => ({
          'Order Number': invoice.orderNumber,
          'Customer Name': invoice.customerName,
          'Email': invoice.customerEmail,
          'Phone': invoice.customerPhone,
          'Total Amount': invoice.totalAmount,
          'Shipping Cost': invoice.shippingCost,
          'Payment Method': invoice.paymentMethod,
          'Status': invoice.status,
          'Created At': new Date(invoice.createdAt).toLocaleDateString(),
          'Items Count': invoice.items.length
        }))
      );

      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Invoices');

      const fileName = `invoices_${new Date().toISOString().split('T')[0]}.xlsx`;
      xlsx.writeFile(workbook, fileName);
    });
  }
}

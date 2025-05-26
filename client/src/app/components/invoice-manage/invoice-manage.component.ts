import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Invoice } from 'src/app/models/invoice';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-invoice-manage',
  templateUrl: './invoice-manage.component.html',
  styleUrls: ['./invoice-manage.component.scss']
})
export class InvoiceManagementComponent implements OnInit {
  invoices$: Observable<Invoice[]>;
  filteredInvoices: Invoice[] = [];
  searchTerm = '';
  statusFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  itemsPerPage = 10;
  isLoading = false;
  selectedInvoice: Invoice | null = null;

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(private invoiceService: InvoiceService) {
    this.invoices$ = this.invoiceService.getInvoices();
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.invoices$.subscribe(invoices => {
      this.filteredInvoices = invoices;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters(): void {
    let filtered = [...this.filteredInvoices];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(invoice => invoice.status === this.statusFilter);
    }

    // Date filters
    if (this.dateFromFilter) {
      const fromDate = new Date(this.dateFromFilter);
      filtered = filtered.filter(invoice => new Date(invoice.createdAt) >= fromDate);
    }

    if (this.dateToFilter) {
      const toDate = new Date(this.dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(invoice => new Date(invoice.createdAt) <= toDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof Invoice];
      let bValue: any = b[this.sortField as keyof Invoice];

      if (this.sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredInvoices = filtered;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }
  onStatusChange(invoiceId: string, event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const selectedStatus = selectElement.value as Invoice['status'];
  this.updateInvoiceStatus(invoiceId, selectedStatus);
}


  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
    try {
      await this.invoiceService.updateInvoiceStatus(invoiceId, status);
      this.loadInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await this.invoiceService.deleteInvoice(invoiceId);
        this.loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  }

  viewInvoiceDetails(invoice: Invoice): void {
    this.selectedInvoice = invoice;
  }

  closeInvoiceDetails(): void {
    this.selectedInvoice = null;
  }

  exportToExcel(): void {
    this.invoiceService.exportToExcel(this.filteredInvoices);
  }

  getPaginatedInvoices(): Invoice[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredInvoices.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}

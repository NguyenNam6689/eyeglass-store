import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from 'src/app/models/item';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-product-manage',
  templateUrl: './product-manage.component.html',
  styleUrls: ['./product-manage.component.scss']
})
export class ProductManagementComponent implements OnInit {
  products$: Observable<Item[]>;
  filteredProducts: Item[] = [];
  selectedProducts: Set<string> = new Set();
  searchTerm = '';
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  itemsPerPage = 10;
  editingProduct: Item | null = null;
  showDeleteConfirm = false;
  isLoading = false;

  constructor(private databaseService: DatabaseService) {
    this.products$ = this.databaseService.getCollection();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.products$.subscribe(products => {
      this.filteredProducts = products;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters(): void {
    let filtered = [...this.filteredProducts];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.for.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[this.sortField as keyof Item];
      const bValue = b[this.sortField as keyof Item];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return this.sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return this.sortDirection === 'asc' ? -1 : 1;

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredProducts = filtered;
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

  toggleProductSelection(productId: string): void {
    if (this.selectedProducts.has(productId)) {
      this.selectedProducts.delete(productId);
    } else {
      this.selectedProducts.add(productId);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedProducts.size === this.getPaginatedProducts().length) {
      this.selectedProducts.clear();
    } else {
      this.getPaginatedProducts().forEach(product => {
        this.selectedProducts.add(product.id);
      });
    }
  }

  editProduct(product: Item): void {
    this.editingProduct = { ...product };
  }

  async saveProduct(): Promise<void> {
    if (!this.editingProduct) return;

    try {
      await this.databaseService.updateProduct(this.editingProduct.id, this.editingProduct);
      this.editingProduct = null;
      this.loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  async deleteSelected(): Promise<void> {
    try {
      const idsToDelete = Array.from(this.selectedProducts);
      await this.databaseService.deleteMultipleProducts(idsToDelete);
      this.selectedProducts.clear();
      this.showDeleteConfirm = false;
      this.loadProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.databaseService.deleteProduct(productId);
      this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  getPaginatedProducts(): Item[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
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
}

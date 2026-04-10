import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { ProductResponse } from '../../../shared/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/category.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, MatIconModule, TitleCasePipe, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-200 pb-6">
        <div>
          <h1 class="text-4xl font-sans font-bold text-brand-dark mb-2">
            {{ category() ? (category() | titlecase) : 'All Collection' }}
          </h1>
          <p class="text-brand-text">Discover our sacred and authentic spiritual items.</p>
        </div>
      </div>
        
      <!-- Search and Filter Bar -->
      <div class="flex flex-col lg:flex-row gap-6 mb-12">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 space-y-8">
          <!-- Search -->
          <div class="relative group">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-dv-green transition-colors">search</mat-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="onFilterChange()"
              placeholder="Search products..." 
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-dv-green focus:ring-4 focus:ring-dv-green/10 outline-none transition-all"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Categories</h3>
            <div class="flex flex-wrap lg:flex-col gap-2">
              <button 
                (click)="selectCategory(null)"
                [class.bg-dv-green]="!selectedCategoryId()"
                [class.text-white]="!selectedCategoryId()"
                class="px-4 py-2 rounded-xl text-sm font-medium border border-transparent hover:bg-gray-100 transition-all text-left"
              >
                All Products
              </button>
              @for (cat of categories(); track cat.id) {
                <button 
                  (click)="selectCategory(cat.id)"
                  [class.bg-dv-green]="selectedCategoryId() === cat.id"
                  [class.text-white]="selectedCategoryId() === cat.id"
                  class="px-4 py-2 rounded-xl text-sm font-medium border border-transparent hover:bg-gray-100 transition-all text-left"
                >
                  {{ cat.name }}
                </button>
              }
            </div>
          </div>

          <!-- Price Filter -->
          <div>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Price Range</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <input type="number" [(ngModel)]="minPrice" (ngModelChange)="onFilterChange()" placeholder="Min" class="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-dv-green outline-none" />
                <span class="text-gray-400">-</span>
                <input type="number" [(ngModel)]="maxPrice" (ngModelChange)="onFilterChange()" placeholder="Max" class="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-dv-green outline-none" />
              </div>
            </div>
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="flex-1">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p class="text-sm text-gray-500">Showing <span class="font-bold text-gray-900">{{ filteredProducts().length }}</span> products</p>
            
            <div class="relative">
              <button 
                (click)="isSortDropdownOpen.set(!isSortDropdownOpen())"
                (blur)="closeDropdownDelay()"
                class="bg-white border border-gray-100 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2 hover:border-dv-green transition-colors focus:outline-none shadow-sm"
              >
                <span class="text-gray-500">Sort:</span>
                <span class="font-bold text-gray-900">{{ getSortLabel() }}</span>
                <mat-icon class="text-gray-400 text-[20px] transition-transform {{ isSortDropdownOpen() ? 'rotate-180' : '' }}">expand_more</mat-icon>
              </button>

              @if (isSortDropdownOpen()) {
                <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20">
                  <button (click)="selectSort('popularity')" class="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 {{ sortBy() === 'popularity' ? 'text-dv-green font-bold' : '' }}">Popularity</button>
                  <button (click)="selectSort('newest')" class="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 {{ sortBy() === 'newest' ? 'text-dv-green font-bold' : '' }}">Newest Arrivals</button>
                  <button (click)="selectSort('price_asc')" class="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 {{ sortBy() === 'price_asc' ? 'text-dv-green font-bold' : '' }}">Price: Low to High</button>
                  <button (click)="selectSort('price_desc')" class="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 {{ sortBy() === 'price_desc' ? 'text-dv-green font-bold' : '' }}">Price: High to Low</button>
                </div>
              }
            </div>
          </div>

          @if (isLoading()) {
            <div class="flex justify-center items-center h-64">
              <mat-icon class="animate-spin text-dv-green text-4xl">refresh</mat-icon>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (product of filteredProducts(); track product.id) {
                <app-product-card 
                  [product]="product" 
                  (addToCart)="onAddToCart($event)"
                />
              }
            </div>
            
            @if (filteredProducts().length === 0) {
              <div class="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <mat-icon class="text-6xl text-gray-300 mb-4">search_off</mat-icon>
                <h3 class="text-xl font-bold text-gray-900 mb-1">No products found</h3>
                <p class="text-sm text-gray-500">Try adjusting your filters or search query.</p>
                <button (click)="resetFilters()" class="mt-6 text-dv-green font-bold hover:underline">Clear all filters</button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private snackbar = inject(SnackbarService);
  private cartService = inject(CartService);

  products = signal<ProductResponse[]>([]);
  filteredProducts = signal<ProductResponse[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  category = signal<string | null>(null);
  selectedCategoryId = signal<string | null>(null);
  sortBy = signal<'popularity' | 'price_asc' | 'price_desc' | 'newest'>('popularity');

  // Filter state
  searchQuery = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  private categoryService = inject(CategoryService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryId.set(params['category']);
      }
      this.fetchProducts();
      this.fetchCategories();
    });
  }

  fetchCategories() {
    this.categoryService.getCategories().subscribe(cats => this.categories.set(cats));
  }

  onFilterChange() {
    let filtered = [...this.products()];

    // Search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name?.toLowerCase() || '').includes(q) || 
        (p.description?.toLowerCase() || '').includes(q) ||
        (p.productCode?.toLowerCase() || '').includes(q)
      );
    }

    // Category
    if (this.selectedCategoryId()) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategoryId());
    }

    // Price
    if (this.minPrice !== null) {
      filtered = filtered.filter(p => p.price >= this.minPrice!);
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= this.maxPrice!);
    }

    this.filteredProducts.set(filtered);
    this.sortFilteredProducts(this.sortBy());
  }

  selectCategory(id: string | null) {
    this.selectedCategoryId.set(id);
    this.onFilterChange();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategoryId.set(null);
    this.minPrice = null;
    this.maxPrice = null;
    this.onFilterChange();
  }

  sortFilteredProducts(value: 'popularity' | 'price_asc' | 'price_desc' | 'newest') {
    const sorted = [...this.filteredProducts()];
    switch (value) {
      case 'popularity': sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)); break;
      case 'price_asc': sorted.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price_desc': sorted.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'newest': 
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default: break;
    }
    this.filteredProducts.set(sorted);
  }

  sortProducts(value: 'popularity' | 'price_asc' | 'price_desc' | 'newest') {
    const sorted = [...this.products()];
    switch (value) {
      case 'price_asc':
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popularity':
      default:
        sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
    }
    this.products.set(sorted);
  }

  fetchProducts() {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (this.category()) {
      params = params.set('category', this.category()!);
    }

    this.api.get<ProductResponse[]>('/products', params).subscribe({
      next: (data) => {
        this.products.set(data);
        this.onFilterChange(); // This handles sorting too
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.filteredProducts.set([]);
        this.isLoading.set(false);
        this.snackbar.showError('Unable to load products right now.');
      }
    });
  }

  isSortDropdownOpen = signal(false);

  getSortLabel(): string {
    const map = {
      'popularity': 'Popularity',
      'price_asc': 'Price: Low to High',
      'price_desc': 'Price: High to Low',
      'newest': 'Newest Arrivals'
    };
    return map[this.sortBy()];
  }

  selectSort(value: 'popularity' | 'price_asc' | 'price_desc' | 'newest') {
    this.sortBy.set(value);
    this.sortFilteredProducts(value);
    this.isSortDropdownOpen.set(false);
  }

  closeDropdownDelay() {
    setTimeout(() => this.isSortDropdownOpen.set(false), 200);
  }

  onAddToCart(product: ProductResponse) {
    this.cartService.addToCart(product, 1);
    this.snackbar.showSuccess(`Added ${product.name} to cart`);
  }
}

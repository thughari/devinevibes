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

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, MatIconModule, TitleCasePipe],
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
        
        <!-- Filters -->
        <div class="mt-6 md:mt-0 flex gap-4 relative">
          <button 
            (click)="isSortDropdownOpen.set(!isSortDropdownOpen())"
            (blur)="closeDropdownDelay()"
            class="bg-white border border-gray-200 text-brand-dark font-sans text-sm rounded-full px-5 py-2.5 flex items-center justify-between min-w-[220px] hover:border-brand-gold transition-colors focus:outline-none focus:ring-1 focus:ring-brand-gold shadow-sm"
          >
            <span class="tracking-wide">Sort by: <span class="font-medium ml-1">{{ getSortLabel() }}</span></span>
            <mat-icon class="text-gray-400 text-[20px] transition-transform duration-300 {{ isSortDropdownOpen() ? 'rotate-180' : '' }}">expand_more</mat-icon>
          </button>

          @if (isSortDropdownOpen()) {
            <div class="absolute right-0 top-full mt-2 w-full min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden z-20">
              <button (click)="selectSort('featured')" class="w-full text-left px-5 py-3 text-sm transition-colors text-brand-dark hover:bg-[#FAFAFA] hover:text-brand-gold {{ sortBy() === 'featured' ? 'bg-[#FAFAFA] text-brand-gold font-medium' : '' }}">Featured</button>
              <button (click)="selectSort('price_asc')" class="w-full text-left px-5 py-3 text-sm transition-colors text-brand-dark hover:bg-[#FAFAFA] hover:text-brand-gold {{ sortBy() === 'price_asc' ? 'bg-[#FAFAFA] text-brand-gold font-medium' : '' }}">Price: Low to High</button>
              <button (click)="selectSort('price_desc')" class="w-full text-left px-5 py-3 text-sm transition-colors text-brand-dark hover:bg-[#FAFAFA] hover:text-brand-gold {{ sortBy() === 'price_desc' ? 'bg-[#FAFAFA] text-brand-gold font-medium' : '' }}">Price: High to Low</button>
              <button (click)="selectSort('newest')" class="w-full text-left px-5 py-3 text-sm transition-colors text-brand-dark hover:bg-[#FAFAFA] hover:text-brand-gold {{ sortBy() === 'newest' ? 'bg-[#FAFAFA] text-brand-gold font-medium' : '' }}">Newest Arrivals</button>
            </div>
          }
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <mat-icon class="animate-spin text-brand-green text-4xl">refresh</mat-icon>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          @for (product of products(); track product.id) {
            <app-product-card 
              [product]="product" 
              (addToCart)="onAddToCart($event)"
            />
          }
        </div>
        
        @if (products().length === 0) {
          <div class="text-center py-20">
            <mat-icon class="text-6xl text-gray-300 mb-4">inventory_2</mat-icon>
            <h3 class="text-xl font-sans font-medium text-brand-dark mb-2">No products found</h3>
            <p class="text-brand-text">Try adjusting your filters or category.</p>
          </div>
        }
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private snackbar = inject(SnackbarService);
  private cartService = inject(CartService);

  products = signal<ProductResponse[]>([]);
  isLoading = signal(true);
  category = signal<string | null>(null);
  sortBy = signal<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.category.set(params['category'] || null);
      this.fetchProducts();
    });
  }

  sortProducts(value: 'featured' | 'price_asc' | 'price_desc' | 'newest') {
    const sorted = [...this.products()];
    switch (value) {
      case 'price_asc':
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price_desc':
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
        // If no created date exists, fall back to current order (or reverse by UUID maybe)
        sorted.sort((a, b) => (a.id.toString() < b.id.toString() ? 1 : -1));
        break;
      case 'featured':
      default:
        // original order from API
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
        this.sortProducts(this.sortBy());
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.isLoading.set(false);
        this.snackbar.showError('Unable to load products right now.');
      }
    });
  }

  isSortDropdownOpen = signal(false);

  getSortLabel(): string {
    const map = {
      'featured': 'Featured',
      'price_asc': 'Low to High',
      'price_desc': 'High to Low',
      'newest': 'Newest Arrivals'
    };
    return map[this.sortBy()];
  }

  selectSort(value: 'featured' | 'price_asc' | 'price_desc' | 'newest') {
    this.sortBy.set(value);
    this.sortProducts(value);
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

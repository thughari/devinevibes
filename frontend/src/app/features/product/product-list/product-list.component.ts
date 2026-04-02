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
        
        <!-- Filters (Mock) -->
        <div class="mt-6 md:mt-0 flex gap-4">
          <select class="bg-white border border-gray-300 text-brand-text text-sm rounded-sm focus:ring-brand-green focus:border-brand-green block w-full p-2.5">
            <option selected>Sort by: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.category.set(params['category'] || null);
      this.fetchProducts();
    });
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
        this.isLoading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.isLoading.set(false);
        this.snackbar.showError('Unable to load products right now.');
      }
    });
  }

  onAddToCart(product: ProductResponse) {
    this.cartService.addToCart(product, 1);
    this.snackbar.showSuccess(`Added ${product.name} to cart`);
  }
}

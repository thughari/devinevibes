import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ProductResponse } from '../../../shared/models/product.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Breadcrumbs -->
      <nav class="flex mb-8 text-sm text-brand-text">
        <ol class="flex items-center space-x-2">
          <li><a routerLink="/" class="hover:text-brand-green transition-colors">Home</a></li>
          <li><span class="mx-2">/</span></li>
          <li><a routerLink="/products" class="hover:text-brand-green transition-colors">Shop</a></li>
          <li><span class="mx-2">/</span></li>
          <li class="text-brand-dark font-medium truncate max-w-[200px]">{{ product()?.name || 'Loading...' }}</li>
        </ol>
      </nav>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-96">
          <mat-icon class="animate-spin text-brand-green text-4xl">refresh</mat-icon>
        </div>
      } @else if (product()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Image Gallery -->
          <div class="space-y-4">
            <div class="aspect-square rounded-lg overflow-hidden bg-brand-gray border border-gray-100">
              <img 
                [src]="product()?.imageUrl || 'https://picsum.photos/seed/' + product()?.id + '/800/800'" 
                [alt]="product()?.name"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover"
              />
            </div>
            <!-- Thumbnails (Mock) -->
            <div class="grid grid-cols-4 gap-4">
              <div class="aspect-square rounded-md overflow-hidden border-2 border-brand-green bg-brand-gray cursor-pointer">
                <img [src]="product()?.imageUrl || 'https://picsum.photos/seed/' + product()?.id + '/200/200'" alt="Thumb" class="w-full h-full object-cover opacity-100" referrerpolicy="no-referrer">
              </div>
              <div class="aspect-square rounded-md overflow-hidden border border-gray-200 bg-brand-gray cursor-pointer hover:border-brand-green transition-colors">
                <img src="https://picsum.photos/seed/detail1/200/200" alt="Thumb" class="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" referrerpolicy="no-referrer">
              </div>
              <div class="aspect-square rounded-md overflow-hidden border border-gray-200 bg-brand-gray cursor-pointer hover:border-brand-green transition-colors">
                <img src="https://picsum.photos/seed/detail2/200/200" alt="Thumb" class="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" referrerpolicy="no-referrer">
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex flex-col">
            <div class="mb-6">
              <h1 class="text-3xl md:text-4xl font-sans font-bold text-brand-dark mb-4">{{ product()?.name }}</h1>
              <div class="flex items-center gap-4 mb-6">
                <span class="text-2xl font-bold text-brand-dark">{{ product()?.price | currency:'INR':'symbol':'1.0-0' }}</span>
                @if (product()!.stock > 0) {
                  <span class="px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">In Stock</span>
                } @else {
                  <span class="px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">Out of Stock</span>
                }
              </div>
              
              <div class="prose prose-sm max-w-none text-brand-text">
                <p>{{ product()?.description }}</p>
                <p class="mt-4">
                  All our products are 100% authentic and properly energized before dispatch. 
                  Each item comes with a certificate of authenticity.
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 pt-8 border-t border-gray-100">
              <div class="flex items-center gap-4 mb-6">
                <label for="quantity" class="text-sm font-medium text-brand-dark">Quantity</label>
                <div class="flex items-center border border-gray-300 rounded-sm bg-white">
                  <button (click)="decrementQuantity()" class="px-3 py-1 text-brand-text hover:bg-gray-50 transition-colors disabled:opacity-50" [disabled]="quantity() <= 1">
                    <mat-icon class="text-sm">remove</mat-icon>
                  </button>
                  <input type="number" id="quantity" [value]="quantity()" readonly class="w-12 text-center bg-transparent border-none focus:ring-0 text-brand-dark p-0 sm:text-sm">
                  <button (click)="incrementQuantity()" class="px-3 py-1 text-brand-text hover:bg-gray-50 transition-colors disabled:opacity-50" [disabled]="quantity() >= product()!.stock">
                    <mat-icon class="text-sm">add</mat-icon>
                  </button>
                </div>
                <span class="text-xs text-brand-text">{{ product()?.stock }} available</span>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <button 
                  (click)="addToCart()"
                  [disabled]="product()?.stock === 0"
                  class="flex-1 bg-brand-green text-white py-4 px-8 rounded-sm font-medium uppercase tracking-wider hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  <mat-icon>shopping_cart</mat-icon>
                  Add to Cart
                </button>
                <button 
                  class="w-full sm:w-auto border border-brand-green text-brand-green py-4 px-6 rounded-sm hover:bg-brand-green/5 transition-colors flex items-center justify-center"
                  title="Add to Wishlist"
                >
                  <mat-icon>favorite_border</mat-icon>
                </button>
              </div>
            </div>

            <!-- Features -->
            <div class="mt-12 grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
              <div class="flex items-start gap-3">
                <mat-icon class="text-brand-green">verified</mat-icon>
                <div>
                  <h4 class="text-sm font-medium text-brand-dark">Certified Authentic</h4>
                  <p class="text-xs text-brand-text mt-1">Lab tested quality</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <mat-icon class="text-brand-green">spa</mat-icon>
                <div>
                  <h4 class="text-sm font-medium text-brand-dark">Energized</h4>
                  <p class="text-xs text-brand-text mt-1">Ready for practice</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <mat-icon class="text-brand-green">local_shipping</mat-icon>
                <div>
                  <h4 class="text-sm font-medium text-brand-dark">Free Shipping</h4>
                  <p class="text-xs text-brand-text mt-1">On orders over ₹1000</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <mat-icon class="text-brand-green">support_agent</mat-icon>
                <div>
                  <h4 class="text-sm font-medium text-brand-dark">Expert Support</h4>
                  <p class="text-xs text-brand-text mt-1">Guidance available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20">
          <mat-icon class="text-6xl text-red-500/50 mb-4">error_outline</mat-icon>
          <h3 class="text-xl font-sans font-medium text-brand-dark mb-2">Product Not Found</h3>
          <p class="text-brand-text mb-6">The item you're looking for doesn't exist or has been removed.</p>
          <a routerLink="/products" class="text-brand-green hover:underline">Return to Shop</a>
        </div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);

  product = signal<ProductResponse | null>(null);
  isLoading = signal(true);
  quantity = signal(1);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProduct(id);
      }
    });
  }

  fetchProduct(id: string) {
    this.isLoading.set(true);
    this.api.get<ProductResponse>(`/products/${id}`).subscribe({
      next: (data) => {
        this.product.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Mock data for demo
        setTimeout(() => {
          this.product.set({ 
            id: id, 
            name: 'Premium 5 Mukhi Rudraksha Mala', 
            description: 'This authentic 5 Mukhi Rudraksha Mala from Nepal consists of 108+1 carefully selected beads. Five Mukhi Rudraksha is governed by the planet Jupiter and is known to bring peace, good health, and spiritual growth to the wearer. It is the most widely used Rudraksha for chanting mantras and daily wear.', 
            price: 1500, 
            stock: 10, 
            imageUrl: `https://picsum.photos/seed/${id}/800/800` 
          });
          this.isLoading.set(false);
        }, 500);
      }
    });
  }

  incrementQuantity() {
    if (this.product() && this.quantity() < this.product()!.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    if (this.product()) {
      // In real app, call CartService
      this.snackbar.showSuccess(`Added ${this.quantity()}x ${this.product()!.name} to cart`);
    }
  }
}

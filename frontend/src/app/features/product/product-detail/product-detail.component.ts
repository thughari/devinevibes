import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ProductResponse } from '../../../shared/models/product.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

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
                [src]="selectedMedia() || product()?.imageUrl || 'assets/images/placeholder-product.webp'"
                [alt]="product()?.name"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="grid grid-cols-4 gap-4">
              @for (img of allGalleryImages(); track img) {
                @if (img) {
                  <button type="button" (click)="setSelectedMedia(img)" class="aspect-square rounded-md overflow-hidden border bg-brand-gray cursor-pointer hover:border-brand-green transition-colors">
                    <img [src]="img" alt="Thumb" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                  </button>
                }
              }
            </div>
            @if ((product()?.videoUrls || []).length > 0) {
              <div class="space-y-2">
                <h4 class="text-sm font-semibold text-brand-dark">Product Videos</h4>
                @for (videoUrl of product()?.videoUrls || []; track videoUrl) {
                  <video controls class="w-full rounded-md border border-gray-200 bg-black">
                    <source [src]="videoUrl" />
                  </video>
                }
              </div>
            }
          </div>

          <!-- Product Info -->
          <div class="flex flex-col">
            <div class="mb-6">
              @if (currentProduct) {
                <h1 class="text-3xl md:text-5xl font-serif font-bold text-brand-dark mb-4 tracking-tight leading-tight">{{ currentProduct.name }}</h1>
                <div class="flex items-center gap-4 mb-8">
                  @if (currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price) {
                    <span class="text-sm text-gray-400 line-through tracking-wider">{{ currentProduct.originalPrice | currency:'INR':'symbol':'1.0-0' }}</span>
                  }
                  <span class="text-3xl font-sans font-medium text-brand-dark tracking-wide">{{ currentProduct.price | currency:'INR':'symbol':'1.0-0' }}</span>
                  @if (currentProduct.stock > 0) {
                    <span class="px-3 py-1 rounded-sm text-[10px] font-bold bg-[#edf7f2] text-brand-green border border-brand-green/20 uppercase tracking-widest">In Stock</span>
                  } @else {
                    <span class="px-3 py-1 rounded-sm text-[10px] font-bold bg-[#fce8e8] text-[#a33838] border border-[#a33838]/20 uppercase tracking-widest">Out of Stock</span>
                  }
                </div>

                <div class="prose prose-sm max-w-none text-brand-text font-light leading-relaxed">
                  <p>{{ product()?.description }}</p>
                  <p class="mt-4 italic">
                    All our products are 100% authentic and properly energized before dispatch.
                  </p>
                </div>
              }
            </div>

            <!-- Actions -->
            <div class="mt-8 pt-8 border-t border-gray-100">
              <div class="flex items-center gap-4 mb-8">
                <label for="quantity" class="text-[11px] font-bold uppercase tracking-widest text-brand-dark">Quantity</label>
                <div class="flex items-center border border-gray-200 rounded-sm bg-white shadow-sm overflow-hidden">
                  <button (click)="decrementQuantity()" class="px-4 py-2 text-brand-text hover:bg-brand-gray transition-colors disabled:opacity-50" [disabled]="quantity() <= 1">
                    <mat-icon class="text-sm w-4 h-4 leading-4 flex items-center justify-center">remove</mat-icon>
                  </button>
                  <input type="number" id="quantity" [value]="quantity()" readonly class="w-12 text-center bg-transparent border-none focus:ring-0 text-brand-dark p-0 font-medium font-sans">
                  <button (click)="incrementQuantity()" class="px-4 py-2 text-brand-text hover:bg-brand-gray transition-colors disabled:opacity-50" [disabled]="quantity() >= product()!.stock">
                    <mat-icon class="text-sm w-4 h-4 leading-4 flex items-center justify-center">add</mat-icon>
                  </button>
                </div>
                <span class="text-[10px] uppercase tracking-widest text-brand-text">{{ product()?.stock }} available</span>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <button 
                  (click)="addToCart()"
                  [disabled]="product()?.stock === 0"
                  class="flex-1 bg-brand-green text-white py-4 px-8 rounded-full font-sans font-medium uppercase tracking-widest hover:bg-brand-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(31,122,85,0.3)] hover:shadow-[0_8px_30px_rgba(199,154,42,0.4)]"
                >
                  <mat-icon class="text-[20px] w-[20px] h-[20px]">shopping_bag</mat-icon>
                  Add to Bag
                </button>
                <button 
                  (click)="toggleWishlist()"
                  class="w-full sm:w-auto border border-brand-green text-brand-green py-4 px-6 rounded-sm hover:bg-brand-green/5 transition-colors flex items-center justify-center group"
                  [class.bg-brand-green]="isInWishlist()"
                  [class.text-white]="isInWishlist()"
                  [title]="isInWishlist() ? 'Remove from Wishlist' : 'Add to Wishlist'"
                >
                  <mat-icon>{{ isInWishlist() ? 'favorite' : 'favorite_border' }}</mat-icon>
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
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  product = signal<ProductResponse | null>(null);
  isLoading = signal(true);
  quantity = signal(1);
  selectedMedia = signal<string | null>(null);

  isInWishlist = computed(() => {
    const prod = this.product();
    return prod ? this.wishlistService.isInWishlist(prod.id) : false;
  });

  allGalleryImages = computed(() => {
    const prod = this.product();
    if (!prod) return [];
    
    const images = new Set<string>();
    if (prod.imageUrl) images.add(prod.imageUrl);
    if (prod.imageUrls) {
      prod.imageUrls.forEach(url => {
        if (url) images.add(url);
      });
    }
    return Array.from(images);
  });

  get currentProduct(): ProductResponse | null {
    return this.product();
  }

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
        this.selectedMedia.set(data.imageUrl || (data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls[0] : null));
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.selectedMedia.set(null);
        this.isLoading.set(false);
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
      this.cartService.addToCart(this.product()!, this.quantity());
      this.snackbar.showSuccess(`Added ${this.quantity()}x ${this.product()!.name} to cart`);
    }
  }

  setSelectedMedia(url: string) {
    this.selectedMedia.set(url);
  }

  toggleWishlist() {
    const prod = this.product();
    if (prod) {
      this.wishlistService.toggle(prod);
      if (this.wishlistService.isInWishlist(prod.id)) {
        this.snackbar.showSuccess(`${prod.name} added to wishlist`);
      } else {
        this.snackbar.showInfo(`${prod.name} removed from wishlist`);
      }
    }
  }
}

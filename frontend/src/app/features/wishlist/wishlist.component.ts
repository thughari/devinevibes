import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatIconModule, MatDialogModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-6xl font-serif font-bold text-brand-dark mb-4 tracking-tight">Your Wishlist</h1>
        <p class="text-lg text-brand-text font-light max-w-2xl mx-auto">Items you've thoughtfully saved for your spiritual journey.</p>
      </div>

      @if (wishlist.count() > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          @for (product of wishlist.items(); track product.id) {
            <div class="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_60px_rgba(0,0,0,0.08)] transition-all duration-700 border border-gray-100 flex flex-col h-full">
              <!-- Image Container -->
              <div class="relative aspect-[4/5] overflow-hidden bg-brand-gray">
                <img 
                  [src]="product.imageUrl || 'assets/images/placeholder-product.webp'" 
                  [alt]="product.name"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                />
                
                <!-- Remove Action -->
                <button 
                  (click)="removeItem(product)"
                  class="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors z-20"
                  title="Remove from Wishlist"
                >
                  <mat-icon class="text-[20px] w-[20px] h-[20px]">delete_outline</mat-icon>
                </button>

                @if (product.originalPrice && product.originalPrice > product.price) {
                  <div class="absolute top-4 left-4 px-3 py-1 bg-brand-gold text-white text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-sm">
                    Sale
                  </div>
                }
              </div>

              <!-- Content Container -->
              <div class="p-8 flex flex-col flex-1">
                <div class="flex-1">
                  <h3 class="text-xl font-serif font-bold text-brand-dark mb-2 tracking-tight line-clamp-2 group-hover:text-brand-green transition-colors">
                    <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
                  </h3>
                  
                  <div class="flex items-center gap-3 mb-6">
                    <span class="text-lg font-sans font-medium text-brand-dark">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
                    @if (product.originalPrice && product.originalPrice > product.price) {
                      <span class="text-xs text-brand-text line-through opacity-60">{{ product.originalPrice | currency:'INR':'symbol':'1.0-0' }}</span>
                    }
                  </div>
                </div>

                <div class="space-y-3">
                  <button 
                    (click)="addToCart(product)"
                    [disabled]="product.stock === 0"
                    class="w-full bg-brand-green text-white py-4 rounded-full font-sans font-medium uppercase tracking-widest hover:bg-brand-gold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(31,122,85,0.2)] disabled:opacity-50 text-sm"
                  >
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">shopping_bag</mat-icon>
                    Add to Bag
                  </button>
                  <a 
                    [routerLink]="['/products', product.id]" 
                    class="block w-full text-center py-3 text-brand-text text-[11px] uppercase tracking-[0.2em] font-medium hover:text-brand-gold transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-32 bg-brand-gray/30 rounded-3xl border border-dashed border-gray-200 border-spacing-4">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <mat-icon class="text-brand-gold text-[40px] w-[40px] h-[40px]">favorite_border</mat-icon>
          </div>
          <h2 class="text-2xl font-serif font-bold text-brand-dark mb-4 tracking-tight">Your Wishlist is Empty</h2>
          <p class="text-brand-text font-light mb-10 max-w-sm mx-auto">Explore our collection of sacred adornments and save your favorites here for later.</p>
          <a routerLink="/products" class="px-10 py-4 bg-brand-green text-white rounded-full font-sans font-medium uppercase tracking-widest hover:bg-brand-green-dark transition-all shadow-lg inline-block">
            Start Shopping
          </a>
        </div>
      }

      <!-- Quick Links -->
      @if (wishlist.count() > 0) {
        <div class="mt-20 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p class="text-brand-text text-sm">Recently updated from your browser storage.</p>
          <div class="flex gap-8">
            <a routerLink="/products" class="text-brand-green font-medium text-sm hover:underline">Continue Shopping</a>
            <a routerLink="/cart" class="text-brand-green font-medium text-sm hover:underline">Go to Bag</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class WishlistComponent {
  wishlist = inject(WishlistService);
  cart = inject(CartService);
  snackbar = inject(SnackbarService);
  private confirmService = inject(ConfirmService);

  addToCart(product: any) {
    this.cart.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl
    }, 1);
    this.snackbar.showSuccess(`${product.name} added to bag`);
  }

  removeItem(product: any) {
    this.confirmService.confirm({
      title: 'Remove from Wishlist?',
      message: `Are you sure you want to remove ${product.name} from your wishlist?`,
      confirmText: 'Remove',
      isDestructive: true
    }).subscribe(confirmed => {
      if (confirmed) {
        this.wishlist.toggle(product);
        this.snackbar.showInfo('Removed from wishlist');
      }
    });
  }
}

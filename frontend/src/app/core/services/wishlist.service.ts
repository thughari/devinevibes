import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductResponse } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private platformId = inject(PLATFORM_ID);
  private readonly WISH_KEY = 'dv_wishlist';
  
  private wishlistItems = signal<ProductResponse[]>([]);
  
  items = computed(() => this.wishlistItems());
  count = computed(() => this.wishlistItems().length);

  constructor() {
    this.loadWishlist();
  }

  private loadWishlist() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.WISH_KEY);
      if (saved) {
        try {
          this.wishlistItems.set(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse wishlist', e);
        }
      }
    }
  }

  toggle(product: ProductResponse) {
    if (!product) return;
    
    const current = this.wishlistItems();
    const index = current.findIndex(p => p.id === product.id);
    
    let updated: ProductResponse[];
    if (index >= 0) {
      updated = current.filter(p => p.id !== product.id);
    } else {
      updated = [...current, product];
    }
    
    this.wishlistItems.set(updated);
    this.saveToDisk(updated);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems().some(p => p.id === productId);
  }

  private saveToDisk(items: ProductResponse[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.WISH_KEY, JSON.stringify(items));
    }
  }
}

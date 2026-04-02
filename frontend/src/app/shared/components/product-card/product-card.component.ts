import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { ProductResponse } from '../../models/product.model';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf, RouterLink, CurrencyPipe, MatIconModule],
  template: `
    <div class="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <!-- Image Container -->
      <div class="relative aspect-square overflow-hidden bg-brand-gray">
        <img 
          [src]="product?.imageUrl || 'assets/images/placeholder-product.webp'" 
          [alt]="product?.name"
          referrerpolicy="no-referrer"
          class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        
        <!-- Quick Add Overlay -->
        <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            (click)="onAddToCart($event)"
            class="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-brand-green text-white px-6 py-2 rounded-sm font-medium uppercase tracking-wider text-sm hover:bg-brand-green-dark flex items-center gap-2 shadow-md"
          >
            <mat-icon class="text-sm">shopping_cart</mat-icon>
            Add to Cart
          </button>
        </div>
        
        @if (product && product.stock <= 5 && product.stock > 0) {
          <div class="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            Only {{ product.stock }} left
          </div>
        }
        @if (product && product.stock === 0) {
          <div class="absolute top-2 left-2 bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            Out of Stock
          </div>
        }
      </div>

      <!-- Content -->
      <div class="p-5 flex flex-col flex-1 text-center">
        <a [routerLink]="['/products', product?.id]" class="block group-hover:text-brand-green transition-colors">
          <h3 class="font-sans text-lg font-medium text-brand-dark mb-1 line-clamp-1">{{ product?.name }}</h3>
        </a>
        <p class="text-sm text-brand-text mb-4 line-clamp-2 flex-1">{{ product?.description }}</p>
        
        <div class="flex items-center justify-center mt-auto pt-4 border-t border-gray-100 gap-2">
          <span *ngIf="product && product.originalPrice != null && product.originalPrice > product.price" class="text-sm text-gray-400 line-through">{{ product.originalPrice | currency:'INR':'symbol':'1.0-0' }}</span>
          <span class="text-brand-dark font-bold text-lg">{{ product?.price | currency:'INR':'symbol':'1.0-0' }}</span>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product?: ProductResponse;
  @Output() addToCart = new EventEmitter<ProductResponse>();

  onAddToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.product) {
      this.addToCart.emit(this.product);
    }
  }
}

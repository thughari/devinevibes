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
    <div class="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[0_20px_40px_rgba(199,154,42,0.08)] transition-all duration-500 flex flex-col h-full ring-1 ring-black/5 hover:ring-brand-gold/30">
      <!-- Image Container -->
      <div class="relative aspect-square overflow-hidden bg-[#FAFAFA]">
        <img 
          [src]="product?.imageUrl || 'assets/images/placeholder-product.webp'" 
          [alt]="product?.name"
          referrerpolicy="no-referrer"
          class="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
        
        <!-- Quick Add Overlay -->
        <div class="absolute inset-0 bg-brand-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[1px]">
          <button 
            (click)="onAddToCart($event)"
            class="translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-white/95 backdrop-blur-md text-brand-dark px-6 py-3 rounded-full font-sans font-medium uppercase tracking-widest text-[11px] hover:bg-brand-gold hover:text-white flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
          >
            <mat-icon class="text-[16px] w-[16px] h-[16px]">shopping_bag</mat-icon>
            Add to Bag
          </button>
        </div>
        
        @if (product && product.stock <= 5 && product.stock > 0) {
          <div class="absolute top-3 left-3 bg-[#a33838] text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-md">
            Only {{ product.stock }} left
          </div>
        }
        @if (product && product.stock === 0) {
          <div class="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span class="bg-brand-dark text-brand-gold text-[11px] font-bold px-4 py-2 rounded-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.2)]">Out of Stock</span>
          </div>
        }
      </div>

      <!-- Content -->
      <div class="p-6 flex flex-col flex-1 text-center bg-white relative z-10">
        <a [routerLink]="['/products', product?.id]" class="block group-hover:text-brand-gold transition-colors duration-300">
          <h3 class="font-serif text-xl font-bold text-brand-dark mb-1.5 line-clamp-1 tracking-wide">{{ product?.name }}</h3>
        </a>
        <p class="text-[13px] text-brand-text mb-5 line-clamp-2 flex-1 font-light leading-relaxed px-2">{{ product?.description }}</p>
        
        <div class="flex items-center justify-center mt-auto pt-4 relative">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-brand-gold/30"></div>
          <div class="flex items-center gap-2.5">
            <span *ngIf="product && product.originalPrice != null && product.originalPrice > product.price" class="text-xs text-gray-400 line-through tracking-wider">{{ product.originalPrice | currency:'INR':'symbol':'1.0-0' }}</span>
            <span class="text-brand-dark font-sans font-medium text-lg tracking-wide">{{ product?.price | currency:'INR':'symbol':'1.0-0' }}</span>
          </div>
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

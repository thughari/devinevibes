import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
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
        <div class="absolute inset-0 bg-brand-dark/5 lg:bg-brand-dark/10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 flex items-end lg:items-center justify-center pb-4 lg:pb-0 backdrop-blur-[0.5px] lg:backdrop-blur-[1px]">
          <button 
            (click)="onAddToCart($event)"
            class="translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 transition-all duration-500 bg-white/95 backdrop-blur-md text-brand-dark px-4 py-2.5 lg:px-6 lg:py-3 rounded-full font-sans font-medium uppercase tracking-widest text-[10px] lg:text-[11px] hover:bg-brand-gold hover:text-white flex items-center gap-1.5 lg:gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
          >
            <mat-icon class="text-[14px] lg:text-[16px] w-[14px] lg:w-[16px] h-[14px] lg:h-[16px] flex items-center justify-center">shopping_bag</mat-icon>
            Add to Bag
          </button>
        </div>

        <!-- Plus One Floating Badge -->
        @if (showPlusOne()) {
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none bg-brand-green text-white font-sans font-bold text-lg px-4 py-2 rounded-full shadow-lg plus-one-animation flex items-center justify-center gap-1">
            <mat-icon class="text-[16px] w-[16px] h-[16px] flex items-center justify-center">done</mat-icon>
            <span>+1</span>
          </div>
        }
        
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
  `,
  styles: [`
    @keyframes floatUpFade {
      0% {
        opacity: 0;
        transform: translate(-50%, 0) scale(0.6);
      }
      15% {
        opacity: 1;
        transform: translate(-50%, -20px) scale(1.1);
      }
      80% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -60px) scale(1);
      }
    }
    .plus-one-animation {
      animation: floatUpFade 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
  `]
})
export class ProductCardComponent {
  @Input() product?: ProductResponse;
  @Output() addToCart = new EventEmitter<ProductResponse>();

  showPlusOne = signal(false);
  private timeoutId: any;

  onAddToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.product) {
      this.addToCart.emit(this.product);
      
      this.showPlusOne.set(false);
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      setTimeout(() => {
        this.showPlusOne.set(true);
        this.timeoutId = setTimeout(() => {
          this.showPlusOne.set(false);
        }, 1200);
      }, 10);
    }
  }
}


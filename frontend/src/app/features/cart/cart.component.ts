import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartItemResponse } from '../../shared/models/cart.model';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl md:text-4xl font-sans font-bold text-brand-dark mb-8">Your Sacred Cart</h1>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <mat-icon class="animate-spin text-brand-green text-4xl">refresh</mat-icon>
        </div>
      } @else if (cartItems().length > 0) {
        <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <!-- Cart Items -->
          <div class="lg:col-span-8">
            <div class="border-t border-b border-gray-200 divide-y divide-gray-200">
              @for (item of cartItems(); track item.cartItemId) {
                <div class="flex py-6 sm:py-8">
                  <div class="flex-shrink-0">
                    <img [src]="item.imageUrl || 'https://picsum.photos/seed/' + item.productId + '/200/200'" 
                         [alt]="item.productName" 
                         referrerpolicy="no-referrer"
                         class="w-24 h-24 rounded-md object-cover object-center sm:w-32 sm:h-32 border border-gray-100">
                  </div>

                  <div class="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div class="flex justify-between">
                          <h3 class="text-lg font-sans font-medium">
                            <a [routerLink]="['/products', item.productId]" class="text-brand-dark hover:text-brand-green transition-colors">
                              {{ item.productName }}
                            </a>
                          </h3>
                        </div>
                        <p class="mt-1 text-sm text-brand-text">{{ item.unitPrice | currency:'INR':'symbol':'1.0-0' }} each</p>
                      </div>

                      <div class="mt-4 sm:mt-0 sm:pr-9 flex items-center justify-between sm:justify-end gap-4">
                        <div class="flex items-center border border-gray-300 rounded-sm bg-white">
                          <button (click)="updateQuantity(item.cartItemId, item.quantity - 1)" class="px-2 py-1 text-brand-text hover:bg-gray-50 transition-colors disabled:opacity-50" [disabled]="item.quantity <= 1">
                            <mat-icon class="text-sm">remove</mat-icon>
                          </button>
                          <span class="w-8 text-center text-brand-dark text-sm">{{ item.quantity }}</span>
                          <button (click)="updateQuantity(item.cartItemId, item.quantity + 1)" class="px-2 py-1 text-brand-text hover:bg-gray-50 transition-colors">
                            <mat-icon class="text-sm">add</mat-icon>
                          </button>
                        </div>

                        <div class="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto">
                          <button type="button" (click)="removeItem(item.cartItemId)" class="-m-2 p-2 inline-flex text-gray-400 hover:text-red-500 transition-colors">
                            <span class="sr-only">Remove</span>
                            <mat-icon class="text-sm">close</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 flex items-center justify-between">
                      <p class="flex items-center text-sm text-brand-text space-x-2">
                        <mat-icon class="text-brand-green text-sm">check_circle</mat-icon>
                        <span>In stock</span>
                      </p>
                      <p class="text-lg font-bold text-brand-dark">{{ item.totalPrice | currency:'INR':'symbol':'1.0-0' }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mt-16 bg-brand-gray border border-gray-100 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-4 sticky top-24 shadow-sm">
            <h2 class="text-lg font-sans font-bold text-brand-dark mb-6">Order Summary</h2>

            <dl class="space-y-4 text-sm text-brand-text">
              <div class="flex items-center justify-between">
                <dt>Subtotal</dt>
                <dd class="font-medium text-brand-dark">{{ subtotal() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <dt class="flex items-center text-sm">
                  <span>Shipping estimate</span>
                </dt>
                <dd class="font-medium text-brand-dark">{{ shipping() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <dt class="flex text-sm">
                  <span>Tax estimate</span>
                </dt>
                <dd class="font-medium text-brand-dark">{{ tax() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <dt class="text-base font-bold text-brand-dark">Order total</dt>
                <dd class="text-xl font-bold text-brand-dark">{{ total() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
            </dl>

            <div class="mt-8">
              <button 
                (click)="checkout()"
                class="w-full bg-brand-green text-white py-4 px-4 rounded-sm font-medium uppercase tracking-wider hover:bg-brand-green-dark transition-colors flex justify-center items-center gap-2 shadow-md"
              >
                Proceed to Checkout
                <mat-icon class="text-sm">arrow_forward</mat-icon>
              </button>
            </div>
            
            <div class="mt-6 text-center text-sm text-brand-text">
              <p>
                or
                <a routerLink="/products" class="text-brand-green font-medium hover:underline">Continue Shopping<span aria-hidden="true"> &rarr;</span></a>
              </p>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20 bg-brand-gray border border-gray-100 rounded-lg shadow-sm">
          <div class="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center mb-6 border border-gray-200">
            <mat-icon class="text-4xl text-brand-green/50">shopping_bag</mat-icon>
          </div>
          <h2 class="text-2xl font-sans font-bold text-brand-dark mb-4">Your cart is empty</h2>
          <p class="text-brand-text mb-8 max-w-md mx-auto">Looks like you haven't added any sacred items to your cart yet.</p>
          <a routerLink="/products" class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-sm text-white bg-brand-green hover:bg-brand-green-dark transition-colors uppercase tracking-wider shadow-md">
            Start Shopping
          </a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  private snackbar = inject(SnackbarService);
  private router = inject(Router);

  isLoading = signal(false);
  
  // Mock data
  cartItems = signal<CartItemResponse[]>([
    { cartItemId: 'c1', productId: '1', productName: '5 Mukhi Rudraksha Mala', quantity: 1, unitPrice: 1500, totalPrice: 1500, imageUrl: 'https://picsum.photos/seed/1/200/200' },
    { cartItemId: 'c2', productId: '2', productName: 'Karungali Mala', quantity: 2, unitPrice: 2200, totalPrice: 4400, imageUrl: 'https://picsum.photos/seed/2/200/200' }
  ]);

  subtotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0));
  shipping = computed(() => this.subtotal() > 5000 ? 0 : 150);
  tax = computed(() => this.subtotal() * 0.18); // 18% GST
  total = computed(() => this.subtotal() + this.shipping() + this.tax());

  updateQuantity(cartItemId: string, newQuantity: number) {
    if (newQuantity < 1) return;
    
    this.cartItems.update(items => 
      items.map(item => {
        if (item.cartItemId === cartItemId) {
          return { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity };
        }
        return item;
      })
    );
  }

  removeItem(cartItemId: string) {
    this.cartItems.update(items => items.filter(item => item.cartItemId !== cartItemId));
    this.snackbar.showInfo('Item removed from cart');
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}

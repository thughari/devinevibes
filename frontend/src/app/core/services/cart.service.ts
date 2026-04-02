import { Injectable, computed, inject, signal } from '@angular/core';
import { AddToCartRequest, CartItemResponse } from '../../shared/models/cart.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

interface GuestCartItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private snackbar = inject(SnackbarService);
  private readonly GUEST_KEY = 'dv_guest_cart';

  items = signal<CartItemResponse[]>([]);
  isLoading = signal(false);
  count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  constructor() {
    this.loadCart();
  }

  loadCart() {
    if (this.auth.isAuthenticated()) {
      this.fetchServerCart();
      return;
    }
    this.items.set(this.readGuestCart().map((item, idx) => ({
      cartItemId: `guest-${idx}`,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      imageUrl: item.imageUrl,
      availableStock: 999 // guest fallback maximum (unknown stock), server check at checkout ensures correctness
    })));
  }

  addToCart(product: { id: string; name: string; price: number; stock: number; imageUrl?: string }, quantity = 1) {
    if (quantity < 1) {
      this.snackbar.showError('Quantity must be at least 1.');
      return;
    }

    if (this.auth.isAuthenticated()) {
      const payload: AddToCartRequest = { productId: product.id, quantity };
      this.api.post('/cart/add', payload).subscribe({
        next: () => this.fetchServerCart(),
        error: (error) => this.snackbar.showError(error?.error?.message || 'Unable to add item to cart')
      });
      return;
    }

    const guest = this.readGuestCart();
    const existing = guest.find(i => i.productId === product.id);
    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > product.stock) {
      this.snackbar.showError(`Cannot add more than ${product.stock} items (stock limit).`);
      return;
    }

    if (existing) existing.quantity = newQuantity;
    else guest.push({ productId: product.id, productName: product.name, imageUrl: product.imageUrl, quantity, unitPrice: product.price });
    this.writeGuestCart(guest);
    this.loadCart();
  }

  updateQuantity(item: CartItemResponse, quantity: number) {
    if (quantity < 1) {
      this.snackbar.showError('Quantity must be at least 1.');
      return;
    }

    if (this.auth.isAuthenticated()) {
      this.api.put<void>(`/cart/${item.cartItemId}?quantity=${quantity}`).subscribe({
        next: () => this.fetchServerCart(),
        error: (error) => this.snackbar.showError(error?.error?.message || 'Unable to update item quantity')
      });
      return;
    }

    this.api.get<{ stock: number }>(`/products/${item.productId}`).subscribe({
      next: (product) => {
        if (quantity > product.stock) {
          this.snackbar.showError(`Cannot set quantity above available stock (${product.stock}).`);
          return;
        }
        const guest = this.readGuestCart().map(i => i.productId === item.productId ? { ...i, quantity } : i);
        this.writeGuestCart(guest);
        this.loadCart();
      },
      error: () => this.snackbar.showError('Unable to verify stock before quantity update.')
    });
  }

  removeItem(item: CartItemResponse) {
    if (this.auth.isAuthenticated()) {
      this.api.delete<void>(`/cart/${item.cartItemId}`).subscribe({ next: () => this.fetchServerCart() });
      return;
    }
    this.writeGuestCart(this.readGuestCart().filter(i => i.productId !== item.productId));
    this.loadCart();
  }

  mergeGuestCartAfterLogin() {
    const guest = this.readGuestCart();
    if (!guest.length || !this.auth.isAuthenticated()) {
      this.fetchServerCart();
      return;
    }

    let pending = guest.length;
    for (const item of guest) {
      this.api.post('/cart/add', { productId: item.productId, quantity: item.quantity }).subscribe({
        next: () => {
          pending -= 1;
          if (pending === 0) {
            this.writeGuestCart([]);
            this.fetchServerCart();
          }
        },
        error: () => {
          pending -= 1;
          if (pending === 0) this.fetchServerCart();
        }
      });
    }
  }

  private fetchServerCart() {
    this.isLoading.set(true);
    this.api.get<CartItemResponse[]>('/cart').subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private readGuestCart(): GuestCartItem[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.GUEST_KEY);
    return raw ? JSON.parse(raw) as GuestCartItem[] : [];
  }

  private writeGuestCart(items: GuestCartItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(items));
  }
}

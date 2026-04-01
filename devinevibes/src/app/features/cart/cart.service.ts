import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AddToCartRequest, CartItemResponse } from '../../shared/models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private readonly api: ApiService) {}

  addToCart(payload: AddToCartRequest): Observable<void> {
    return this.api.post<void>('/cart/add', payload);
  }

  getCart(): Observable<CartItemResponse[]> {
    return this.api.get<CartItemResponse[]>('/cart');
  }
}

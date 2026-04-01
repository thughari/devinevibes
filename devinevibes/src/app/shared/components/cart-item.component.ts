import { Component, Input } from '@angular/core';
import { CartItemResponse } from '../models/cart.model';

@Component({
  selector: 'app-cart-item',
  template: `
    <div class="card row">
      <div>
        <h4>{{ item.productName }}</h4>
        <small>Qty: {{ item.quantity }} × ₹{{ item.unitPrice }}</small>
      </div>
      <strong>₹ {{ item.totalPrice }}</strong>
    </div>
  `,
  styles: [`.row{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}`]
})
export class CartItemComponent {
  @Input({ required: true }) item!: CartItemResponse;
}

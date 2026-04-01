import { Component, OnInit, inject, signal } from '@angular/core';
import { CartService } from './cart.service';
import { CartItemResponse } from '../../shared/models/cart.model';
import { CartItemComponent } from '../../shared/components/cart-item.component';

@Component({
  selector: 'app-cart-page',
  imports: [CartItemComponent],
  template: `
    <section>
      <h2>Your Cart</h2>
      @for (item of items(); track item.cartItemId) {
        <app-cart-item [item]="item" />
      }
      <p>Total: ₹ {{ total() }}</p>
    </section>
  `
})
export class CartPageComponent implements OnInit {
  private readonly cartService = inject(CartService);
  protected readonly items = signal<CartItemResponse[]>([]);
  protected readonly total = signal(0);

  ngOnInit(): void {
    this.cartService.getCart().subscribe((data) => {
      this.items.set(data);
      this.total.set(data.reduce((sum, item) => sum + item.totalPrice, 0));
    });
  }
}

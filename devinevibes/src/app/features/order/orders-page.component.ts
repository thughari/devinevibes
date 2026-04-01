import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from './order.service';
import { OrderResponse, TrackingResponse } from '../../shared/models/order.model';

@Component({
  selector: 'app-orders-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="orders">
      <div class="card">
        <h3>Place Order</h3>
        <form [formGroup]="orderForm" (ngSubmit)="placeOrder()">
          <textarea formControlName="shippingAddress" placeholder="Shipping address"></textarea>
          <button class="btn primary" type="submit">Place Order</button>
        </form>
      </div>

      <div class="card">
        <h3>Order History</h3>
        @for (order of orders(); track order.id) {
          <div class="order">
            <p>{{ order.id }} — ₹{{ order.totalAmount }} — {{ order.orderStatus }}</p>
            <button class="btn" (click)="track(order.id)">Track</button>
          </div>
        }
      </div>

      @if (tracking(); as t) {
        <div class="card">
          <h3>Tracking: {{ t.trackingId || 'Pending allocation' }}</h3>
          <ol class="steps">
            @for (step of steps; track step) {
              <li [class.active]="isActive(step, t.orderStatus)">{{ step }}</li>
            }
          </ol>
        </div>
      }
    </section>
  `,
  styles: [`.orders{display:grid;gap:1rem}.order{display:flex;justify-content:space-between;align-items:center}.steps{display:grid;gap:.4rem;padding-left:1rem}.active{color:var(--gold);font-weight:700}`]
})
export class OrdersPageComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly fb = inject(FormBuilder);

  protected readonly orders = signal<OrderResponse[]>([]);
  protected readonly tracking = signal<TrackingResponse | null>(null);
  protected readonly steps = ['ORDER_PLACED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  protected readonly orderForm = this.fb.group({ shippingAddress: ['', Validators.required] });

  ngOnInit(): void {
    this.loadOrders();
  }

  placeOrder(): void {
    if (this.orderForm.invalid) return;
    this.orderService.placeOrder(this.orderForm.getRawValue() as { shippingAddress: string }).subscribe(() => {
      this.loadOrders();
      this.orderForm.reset();
    });
  }

  track(orderId: string): void {
    this.orderService.getTracking(orderId).subscribe((data) => this.tracking.set(data));
  }

  isActive(step: string, status: string): boolean {
    return this.steps.indexOf(step) <= this.steps.indexOf(status);
  }

  private loadOrders(): void {
    this.orderService.getMyOrders().subscribe((data) => this.orders.set(data));
  }
}

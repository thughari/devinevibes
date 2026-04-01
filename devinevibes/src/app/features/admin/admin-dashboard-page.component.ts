import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from './admin.service';
import { OrderResponse } from '../../shared/models/order.model';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="admin-grid">
      <div class="card">
        <h3>Create Product</h3>
        <form [formGroup]="productForm" (ngSubmit)="createProduct()">
          <input formControlName="name" placeholder="Name" />
          <textarea formControlName="description" placeholder="Description"></textarea>
          <input type="number" formControlName="price" placeholder="Price" />
          <input type="number" formControlName="stock" placeholder="Stock" />
          <input formControlName="imageUrl" placeholder="Image URL" />
          <button class="btn primary" type="submit">Save</button>
        </form>
      </div>

      <div class="card">
        <h3>All Orders</h3>
        @for (order of orders(); track order.id) {
          <p>{{ order.id }} • {{ order.orderStatus }} • {{ order.paymentStatus }}</p>
        }
      </div>
    </section>
  `,
  styles: [`.admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem} form{display:grid;gap:.5rem}`]
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  protected readonly orders = signal<OrderResponse[]>([]);
  protected readonly productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, Validators.required],
    stock: [0, Validators.required],
    imageUrl: ['']
  });

  ngOnInit(): void {
    this.adminService.getOrders().subscribe((data) => this.orders.set(data));
  }

  createProduct(): void {
    if (this.productForm.invalid) return;
    const payload = this.productForm.getRawValue();
    this.adminService.createProduct({
      name: payload.name ?? '',
      description: payload.description ?? '',
      price: payload.price ?? 0,
      stock: payload.stock ?? 0,
      imageUrl: payload.imageUrl ?? undefined
    }).subscribe();
  }
}

import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ApiService } from '../../../core/services/api.service';
import { ProductResponse } from '../../../shared/models/product.model';
import { OrderResponse } from '../../../shared/models/order.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouponResponse } from '../../../shared/models/coupon.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl md:text-4xl font-sans font-medium text-gray-900">Admin Dashboard</h1>
        <button (click)="addProduct()" class="bg-dv-green text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
          <mat-icon class="text-[20px]">add</mat-icon> Add Product
        </button>
      </div>

      @if (showAddProduct()) {
        <form [formGroup]="addProductForm" (ngSubmit)="submitProduct()" class="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input formControlName="name" placeholder="Product name" class="border rounded-md px-3 py-2" />
          <input formControlName="price" type="number" placeholder="Price" class="border rounded-md px-3 py-2" />
          <input formControlName="stock" type="number" placeholder="Stock" class="border rounded-md px-3 py-2" />
          <input formControlName="imageUrl" placeholder="Thumbnail Image URL" class="border rounded-md px-3 py-2" />
          <input formControlName="imageUrls" placeholder="More image URLs (comma separated)" class="md:col-span-2 border rounded-md px-3 py-2" />
          <input formControlName="videoUrls" placeholder="Video URLs (comma separated)" class="md:col-span-2 border rounded-md px-3 py-2" />
          <textarea formControlName="description" placeholder="Description" class="md:col-span-2 border rounded-md px-3 py-2 min-h-24"></textarea>
          <div class="md:col-span-2 flex gap-2">
            <button type="submit" [disabled]="addProductForm.invalid" class="bg-dv-green text-white px-4 py-2 rounded-md">Create Product</button>
            <button type="button" (click)="showAddProduct.set(false)" class="border px-4 py-2 rounded-md">Cancel</button>
          </div>
        </form>
      }

      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button (click)="activeTab.set('products')" [class.text-dv-green]="activeTab() === 'products'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Products</button>
          <button (click)="activeTab.set('orders')" [class.text-dv-green]="activeTab() === 'orders'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Orders</button>
          <button (click)="activeTab.set('coupons')" [class.text-dv-green]="activeTab() === 'coupons'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Coupons</button>
        </nav>
      </div>

      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        @if (activeTab() === 'products') {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs">Product</th><th class="px-6 py-3 text-left text-xs">Price</th><th class="px-6 py-3 text-left text-xs">Stock</th><th class="px-6 py-3 text-right text-xs">Actions</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of products(); track p.id) {
                  <tr>
                    <td class="px-6 py-4"><div class="flex items-center gap-3"><img class="h-10 w-10 rounded-lg object-cover border" [src]="p.imageUrl" alt=""><div><div class="text-sm font-medium">{{ p.name }}</div><div class="text-xs text-gray-500">ID: {{ p.id }}</div></div></div></td>
                    <td class="px-6 py-4 text-sm">{{ p.price | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td class="px-6 py-4 text-sm">{{ p.stock }}</td>
                    <td class="px-6 py-4 text-right text-sm"><button (click)="deleteProduct(p.id)" class="text-red-500">Delete</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (activeTab() === 'orders') {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs">Order ID</th><th class="px-6 py-3 text-left text-xs">Customer</th><th class="px-6 py-3 text-left text-xs">Status</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of orders(); track order.id) {
                <tr>
                  <td class="px-6 py-4 text-sm font-mono">{{ order.id }}</td>
                  <td class="px-6 py-4 text-sm">{{ order.razorpayOrderId || '-' }}</td>
                  <td class="px-6 py-4 text-sm">{{ order.orderStatus }}</td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="p-4">
            <form [formGroup]="couponForm" (ngSubmit)="createCoupon()" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input formControlName="code" placeholder="Coupon code" class="border rounded-md px-3 py-2" />
              <select formControlName="type" class="border rounded-md px-3 py-2">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed</option>
                <option value="BXGX">BXGX</option>
              </select>
              <input formControlName="discountValue" type="number" placeholder="Discount value" class="border rounded-md px-3 py-2" />
              <input formControlName="minimumCartValue" type="number" placeholder="Minimum cart value" class="border rounded-md px-3 py-2" />
              <input formControlName="buyQty" type="number" placeholder="Buy qty" class="border rounded-md px-3 py-2" />
              <input formControlName="getQty" type="number" placeholder="Get qty" class="border rounded-md px-3 py-2" />
              <button type="submit" class="bg-dv-green text-white rounded-md px-4 py-2">Create Coupon</button>
            </form>
            <div class="space-y-2">
              @for (c of coupons(); track c.id) {
                <div class="border rounded-md p-3 flex justify-between items-center">
                  <div>
                    <p class="font-medium">{{ c.code }} <span class="text-xs bg-gray-100 px-2 py-0.5 rounded">{{ c.type }}</span></p>
                    <p class="text-xs text-gray-500">Min: {{ c.minimumCartValue || 0 }} | Discount: {{ c.discountValue || 0 }}</p>
                  </div>
                  <button (click)="deleteCoupon(c.id)" class="text-red-600 text-sm">Delete</button>
                </div>
              } @empty {
                <p class="text-sm text-gray-500">No coupons yet.</p>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  private fb = inject(FormBuilder);
  activeTab = signal<'products' | 'orders' | 'coupons'>('products');
  showAddProduct = signal(false);
  products = signal<ProductResponse[]>([]);
  orders = signal<OrderResponse[]>([]);
  coupons = signal<CouponResponse[]>([]);

  addProductForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    imageUrls: [''],
    videoUrls: ['']
  });

  couponForm = this.fb.group({
    code: ['', Validators.required],
    type: ['PERCENTAGE', Validators.required],
    discountValue: [0],
    minimumCartValue: [0],
    buyQty: [1],
    getQty: [1],
    productId: [''],
    active: [true],
    expiresAt: ['']
  });

  constructor() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.api.get<ProductResponse[]>('/products').subscribe({ next: (products) => this.products.set(products) });
    this.api.get<OrderResponse[]>('/admin/orders').subscribe({ next: (orders) => this.orders.set(orders) });
    this.api.get<CouponResponse[]>('/admin/coupons').subscribe({ next: (coupons) => this.coupons.set(coupons) });
  }

  addProduct() { this.showAddProduct.set(true); }

  deleteProduct(id: string) {
    this.api.delete<void>(`/admin/products/${id}`).subscribe({ next: () => this.products.update(items => items.filter(p => p.id !== id)) });
  }

  submitProduct() {
    if (this.addProductForm.invalid) return;
    const payload = {
      ...this.addProductForm.value,
      imageUrls: (this.addProductForm.value.imageUrls || '').split(',').map(u => u.trim()).filter(Boolean),
      videoUrls: (this.addProductForm.value.videoUrls || '').split(',').map(u => u.trim()).filter(Boolean)
    };
    this.api.post<ProductResponse>('/admin/products', payload).subscribe({
      next: (product) => {
        this.products.update(items => [product, ...items]);
        this.showAddProduct.set(false);
        this.addProductForm.reset({ name: '', description: '', price: 0, stock: 0, imageUrl: '', imageUrls: '', videoUrls: '' });
      },
      error: () => this.snackbar.showError('Unable to create product.')
    });
  }

  createCoupon() {
    if (this.couponForm.invalid) return;
    this.api.post<CouponResponse>('/admin/coupons', this.couponForm.value).subscribe({
      next: (coupon) => {
        this.coupons.update(list => [coupon, ...list]);
        this.couponForm.patchValue({ code: '', discountValue: 0, minimumCartValue: 0, buyQty: 1, getQty: 1, productId: '' });
      },
      error: () => this.snackbar.showError('Unable to create coupon.')
    });
  }

  deleteCoupon(id: string) {
    this.api.delete<void>(`/admin/coupons/${id}`).subscribe({
      next: () => this.coupons.update(list => list.filter(c => c.id !== id)),
      error: () => this.snackbar.showError('Unable to delete coupon.')
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ApiService } from '../../../core/services/api.service';
import { ProductResponse } from '../../../shared/models/product.model';
import { OrderResponse } from '../../../shared/models/order.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl md:text-4xl font-sans font-medium text-gray-900">Admin Dashboard</h1>
        <button (click)="addProduct()" class="bg-dv-green text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
          <mat-icon class="text-[20px]">add</mat-icon> Add Product
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-500 font-medium">Total Revenue</h3>
            <mat-icon class="text-dv-green">account_balance_wallet</mat-icon>
          </div>
          <p class="text-3xl font-sans font-medium text-gray-900">{{ 125400 | currency:'INR':'symbol':'1.0-0' }}</p>
          <p class="text-xs text-green-600 mt-2 flex items-center"><mat-icon class="text-[14px]">arrow_upward</mat-icon> 12% from last month</p>
        </div>
        <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-500 font-medium">Active Orders</h3>
            <mat-icon class="text-dv-green">local_shipping</mat-icon>
          </div>
          <p class="text-3xl font-sans font-medium text-gray-900">24</p>
          <p class="text-xs text-gray-500 mt-2">Needs processing</p>
        </div>
        <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-gray-500 font-medium">Low Stock Items</h3>
            <mat-icon class="text-red-500">warning</mat-icon>
          </div>
          <p class="text-3xl font-sans font-medium text-gray-900">5</p>
          <p class="text-xs text-gray-500 mt-2">Below 5 units</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button 
            (click)="activeTab.set('products')"
            [class.border-dv-green]="activeTab() === 'products'"
            [class.text-dv-green]="activeTab() === 'products'"
            [class.border-transparent]="activeTab() !== 'products'"
            [class.text-gray-500]="activeTab() !== 'products'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-dv-green transition-colors"
          >
            Products
          </button>
          <button 
            (click)="activeTab.set('orders')"
            [class.border-dv-green]="activeTab() === 'orders'"
            [class.text-dv-green]="activeTab() === 'orders'"
            [class.border-transparent]="activeTab() !== 'orders'"
            [class.text-gray-500]="activeTab() !== 'orders'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-dv-green transition-colors"
          >
            Orders
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        @if (activeTab() === 'products') {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of products(); track p.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img class="h-10 w-10 rounded-lg object-cover border border-gray-200" [src]="p.imageUrl" alt="" referrerpolicy="no-referrer">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ p.name }}</div>
                          <div class="text-xs text-gray-500">ID: {{ p.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ p.price | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [class.bg-green-100]="p.stock > 5"
                            [class.text-green-800]="p.stock > 5"
                            [class.bg-red-100]="p.stock <= 5"
                            [class.text-red-800]="p.stock <= 5">
                        {{ p.stock }} units
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button (click)="editProduct(p.id)" class="text-dv-green hover:text-green-700 mr-4"><mat-icon class="text-[20px]">edit</mat-icon></button>
                      <button (click)="deleteProduct(p.id)" class="text-red-500 hover:text-red-700"><mat-icon class="text-[20px]">delete</mat-icon></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of orders(); track order.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{{ order.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ order.razorpayOrderId || "-" }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">{{ order.orderStatus }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button (click)="viewOrderDetails(order.id)" class="text-dv-green hover:text-green-700">View Details</button>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  activeTab = signal<'products' | 'orders'>('products');
  isLoading = signal(false);
  products = signal<ProductResponse[]>([]);
  orders = signal<OrderResponse[]>([]);

  constructor() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    this.api.get<ProductResponse[]>('/products').subscribe({
      next: (products) => this.products.set(products),
      error: () => this.snackbar.showError('Unable to load products.')
    });

    this.api.get<OrderResponse[]>('/admin/orders').subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackbar.showError('Unable to load orders.');
      }
    });
  }

  addProduct() {
    this.snackbar.showInfo('Add Product functionality coming soon!');
  }

  editProduct(id: string) {
    this.snackbar.showInfo(`Edit product ${id} functionality coming soon!`);
  }

  deleteProduct(id: string) {
    this.api.delete<void>(`/admin/products/${id}`).subscribe({
      next: () => {
        this.products.update(items => items.filter(p => p.id !== id));
        this.snackbar.showSuccess('Product deleted successfully.');
      },
      error: () => this.snackbar.showError('Unable to delete product.')
    });
  }

  viewOrderDetails(orderId: string) {
    this.snackbar.showInfo(`Viewing details for order ${orderId}`);
  }
}

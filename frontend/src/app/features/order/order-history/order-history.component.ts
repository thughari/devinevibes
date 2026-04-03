import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { OrderResponse } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl md:text-4xl font-sans font-medium text-gray-900 mb-8">My Orders</h1>

      @if (loading()) {
        <div class="text-center py-16">
          <mat-icon class="text-5xl text-gray-300 animate-spin mb-4">refresh</mat-icon>
          <p class="text-gray-500">Loading your orders...</p>
        </div>
      } @else if (orders().length > 0) {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{{ order.id.substring(0, 8) }}...</span>
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [class.bg-yellow-100]="order.orderStatus === 'PENDING'"
                          [class.text-yellow-800]="order.orderStatus === 'PENDING'"
                          [class.bg-blue-100]="order.orderStatus === 'PAYMENT_SUCCESS'"
                          [class.text-blue-800]="order.orderStatus === 'PAYMENT_SUCCESS'"
                          [class.bg-indigo-100]="order.orderStatus === 'SHIPPED'"
                          [class.text-indigo-800]="order.orderStatus === 'SHIPPED'"
                          [class.bg-purple-100]="order.orderStatus === 'OUT_FOR_DELIVERY'"
                          [class.text-purple-800]="order.orderStatus === 'OUT_FOR_DELIVERY'"
                          [class.bg-green-100]="order.orderStatus === 'DELIVERED'"
                          [class.text-green-800]="order.orderStatus === 'DELIVERED'"
                          [class.bg-red-100]="order.orderStatus === 'CANCELLED'"
                          [class.text-red-800]="order.orderStatus === 'CANCELLED'">
                      {{ order.orderStatus === 'PAYMENT_SUCCESS' ? (order.paymentMethod === 'COD' ? 'ORDER CONFIRMED' : 'PAYMENT SUCCESS') : order.orderStatus.replace('_', ' ') }}
                    </span>
                    <span class="px-2 py-0.5 text-[10px] font-medium rounded-full"
                          [class.bg-green-50]="order.paymentStatus === 'SUCCESS'"
                          [class.text-green-600]="order.paymentStatus === 'SUCCESS'"
                          [class.bg-yellow-50]="order.paymentStatus === 'PENDING'"
                          [class.text-yellow-600]="order.paymentStatus === 'PENDING'"
                          [class.bg-red-50]="order.paymentStatus === 'FAILED'"
                          [class.text-red-600]="order.paymentStatus === 'FAILED'">
                      {{ order.paymentStatus === 'SUCCESS' ? 'PAID' : (order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' ? 'CASH ON DELIVERY' : order.paymentStatus) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <span class="font-semibold text-brand-dark text-lg">{{ order.totalAmount | currency:'INR':'symbol':'1.0-0' }}</span>
                    @if (order.createdAt) {
                      <span class="text-xs">{{ order.createdAt | date:'mediumDate' }}</span>
                    }
                  </div>
                  @if (order.trackingId) {
                    <p class="text-xs text-gray-400 mt-1">Tracking: <span class="font-mono">{{ order.trackingId }}</span></p>
                  }
                </div>
                <a [routerLink]="['/order/tracking', order.id]" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-lg hover:bg-brand-green-dark transition-colors shadow-sm">
                  <mat-icon class="text-[16px]">visibility</mat-icon> Track Order
                </a>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div class="text-center py-16">
            <mat-icon class="text-6xl text-gray-300 mb-4">receipt_long</mat-icon>
            <h3 class="text-xl font-sans font-medium text-gray-900 mb-2">No orders yet</h3>
            <p class="text-gray-500 mb-6">When you place orders, they will appear here.</p>
            <a routerLink="/products" class="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-dv-green hover:bg-green-700 transition-colors">
              Start Shopping
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class OrderHistoryComponent implements OnInit {
  private api = inject(ApiService);
  orders = signal<OrderResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.get<OrderResponse[]>('/orders').subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}


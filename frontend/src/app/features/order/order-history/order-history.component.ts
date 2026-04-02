import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl md:text-4xl font-sans font-medium text-gray-900 mb-8">Order History</h1>

      <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        @if (orders().length > 0) {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                @for (order of orders(); track order.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {{ order.id }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ order.date | date:'mediumDate' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ order.total | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [class.bg-green-100]="order.status === 'Delivered'"
                            [class.text-green-800]="order.status === 'Delivered'"
                            [class.bg-yellow-100]="order.status === 'Processing'"
                            [class.text-yellow-800]="order.status === 'Processing'"
                            [class.bg-blue-100]="order.status === 'Shipped'"
                            [class.text-blue-800]="order.status === 'Shipped'">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a [routerLink]="['/order/tracking', order.id]" class="text-dv-green hover:text-green-700 flex items-center justify-end gap-1">
                        Track <mat-icon class="text-[16px]">arrow_forward</mat-icon>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="text-center py-16">
            <mat-icon class="text-6xl text-gray-300 mb-4">receipt_long</mat-icon>
            <h3 class="text-xl font-sans font-medium text-gray-900 mb-2">No orders yet</h3>
            <p class="text-gray-500 mb-6">When you place orders, they will appear here.</p>
            <a routerLink="/products" class="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-dv-green hover:bg-green-700 transition-colors">
              Start Shopping
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class OrderHistoryComponent {
  orders = signal<any[]>([]);
}

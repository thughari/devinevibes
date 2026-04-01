import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <!-- Header -->
        <div class="px-6 py-8 border-b border-gray-100 text-center bg-gray-50/50">
          <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <mat-icon class="text-dv-green text-3xl">check_circle</mat-icon>
          </div>
          <h1 class="text-3xl font-sans font-medium text-gray-900 mb-2">Order Confirmed</h1>
          <p class="text-gray-500">Thank you for your purchase. Your sacred items are being prepared.</p>
          <div class="mt-6 inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <span class="text-sm text-gray-500 mr-2">Order ID:</span>
            <span class="font-mono text-gray-900 font-medium">{{ orderId() }}</span>
          </div>
        </div>

        <!-- Tracking Timeline -->
        <div class="px-6 py-10 sm:px-10">
          <h2 class="text-xl font-sans font-medium text-gray-900 mb-8">Tracking Status</h2>
          
          <div class="relative">
            <!-- Vertical Line -->
            <div class="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>

            <!-- Steps -->
            <div class="space-y-8 relative">
              
              <!-- Step 1: Placed -->
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-dv-green flex items-center justify-center z-10 shadow-sm">
                  <mat-icon class="text-white">receipt_long</mat-icon>
                </div>
                <div class="ml-6 pt-2">
                  <h3 class="text-lg font-medium text-gray-900">Order Placed</h3>
                  <p class="text-sm text-gray-500 mt-1">We have received your order and payment.</p>
                  <span class="text-xs text-gray-400 mt-2 block">Today, 10:30 AM</span>
                </div>
              </div>

              <!-- Step 2: Processing -->
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-dv-green flex items-center justify-center z-10 shadow-sm">
                  <mat-icon class="text-white">spa</mat-icon>
                </div>
                <div class="ml-6 pt-2">
                  <h3 class="text-lg font-medium text-gray-900">Processing & Energizing</h3>
                  <p class="text-sm text-gray-500 mt-1">Your items are being carefully selected and energized.</p>
                  <span class="text-xs text-dv-green mt-2 block font-medium">In Progress</span>
                </div>
              </div>

              <!-- Step 3: Shipped -->
              <div class="flex items-start opacity-50">
                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                  <mat-icon class="text-gray-400">local_shipping</mat-icon>
                </div>
                <div class="ml-6 pt-2">
                  <h3 class="text-lg font-medium text-gray-400">Shipped</h3>
                  <p class="text-sm text-gray-400 mt-1">Handed over to our delivery partner.</p>
                </div>
              </div>

              <!-- Step 4: Out for Delivery -->
              <div class="flex items-start opacity-50">
                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                  <mat-icon class="text-gray-400">directions_bike</mat-icon>
                </div>
                <div class="ml-6 pt-2">
                  <h3 class="text-lg font-medium text-gray-400">Out for Delivery</h3>
                  <p class="text-sm text-gray-400 mt-1">The package is on its way to your address.</p>
                </div>
              </div>

              <!-- Step 5: Delivered -->
              <div class="flex items-start opacity-50">
                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                  <mat-icon class="text-gray-400">home</mat-icon>
                </div>
                <div class="ml-6 pt-2">
                  <h3 class="text-lg font-medium text-gray-400">Delivered</h3>
                  <p class="text-sm text-gray-400 mt-1">Package delivered successfully.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="bg-gray-50 px-6 py-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <a routerLink="/products" class="text-dv-green hover:underline text-sm font-medium">Continue Shopping</a>
          <a routerLink="/order/history" class="px-6 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            View All Orders
          </a>
        </div>
      </div>
    </div>
  `
})
export class OrderTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  orderId = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.orderId.set(params.get('id') || 'UNKNOWN');
    });
  }
}

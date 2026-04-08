import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfigService } from '../../../core/services/config.service';
import { OrderResponse } from '../../../shared/models/order.model';

const STATUS_STEPS = ['PENDING', 'PAYMENT_SUCCESS', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe],
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
          <div class="mt-6 inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm ml-2">
            <span class="text-sm text-gray-500 mr-2">Payment:</span>
            <span class="font-mono text-gray-900 font-medium">{{ tracking()?.paymentMethod || 'Prepaid' }}</span>
          </div>
          <div class="mt-6 inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm ml-2">
            <span class="text-sm text-gray-500 mr-2">Order:</span>
            <span class="font-mono text-gray-900 font-bold">{{ tracking()?.orderNumber || orderId() }}</span>
          </div>
          @if (tracking()?.trackingId) {
            <div class="mt-2 inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm ml-2">
              <span class="text-sm text-gray-500 mr-2">AWB Tracking:</span>
              <span class="font-mono text-gray-900 font-medium">{{ tracking()?.trackingId }}</span>
            </div>
          }
        </div>

        <!-- Tracking Timeline -->
        <div class="px-6 py-10 sm:px-10">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-sans font-medium text-gray-900">Tracking Status</h2>
            @if (canCancel()) {
              <button (click)="cancelOrder()" class="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full border border-red-100 transition-all">
                Cancel Order
              </button>
            }
          </div>
          
          @if (loading()) {
            <p class="text-sm text-gray-400 text-center py-8">Loading tracking info...</p>
          } @else {
            <div class="relative">
              <!-- Vertical Line -->
              <div class="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>

              <div class="space-y-8 relative">
                @for (step of resolvedSteps(); track step.key; let i = $index) {
                  <div class="flex items-start" [class.opacity-40]="!isStepReached(step.key)">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-sm"
                         [class.bg-dv-green]="isStepReached(step.key)"
                         [class.bg-white]="!isStepReached(step.key)"
                         [class.border-2]="!isStepReached(step.key)"
                         [class.border-gray-200]="!isStepReached(step.key)">
                      <mat-icon [class.text-white]="isStepReached(step.key)" [class.text-gray-400]="!isStepReached(step.key)">{{ step.icon }}</mat-icon>
                    </div>
                    <div class="ml-6 pt-2">
                      <h3 class="text-lg font-medium" [class.text-gray-900]="isStepReached(step.key)" [class.text-gray-400]="!isStepReached(step.key)">{{ step.label }}</h3>
                      <p class="text-sm mt-1" [class.text-gray-500]="isStepReached(step.key)" [class.text-gray-400]="!isStepReached(step.key)">{{ step.description }}</p>
                      @if (isCurrentStep(step.key)) {
                        <span class="text-xs text-dv-green mt-2 block font-medium">● Current Status</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
        
        <!-- Ordered Items & Cost Breakup -->
        @if (tracking()?.items?.length) {
          <div class="px-6 pb-10 sm:px-10 pt-4 border-t border-gray-100">
            <h2 class="text-xl font-sans font-medium text-gray-900 mb-6">Order Summary</h2>
            <div class="flow-root mb-8">
              <ul role="list" class="-my-4 divide-y divide-gray-200">
                @for (item of tracking()!.items; track item.productId) {
                  <li class="flex py-4 group" [routerLink]="['/product', item.productId]">
                    <div class="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-lg overflow-hidden shadow-sm group-hover:border-dv-green transition-colors">
                      <img [src]="item.imageUrl || 'assets/images/placeholder-product.webp'" alt="Product" class="w-full h-full object-cover">
                    </div>
                    <div class="ml-4 flex-1 flex flex-col justify-center">
                      <div class="flex justify-between text-sm font-medium text-brand-dark">
                        <h3 class="font-sans group-hover:text-dv-green transition-colors">{{ item.productName }}</h3>
                        <p class="font-bold text-brand-dark">{{ item.totalPrice | currency:'INR':'symbol':'1.0-0' }}</p>
                      </div>
                      <div class="mt-1 flex items-end justify-between text-xs text-gray-500">
                        <p>Qty {{ item.quantity }} × {{ item.unitPrice | currency:'INR':'symbol':'1.0-0' }}</p>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            </div>

            <!-- Cost Breakup -->
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <dt class="text-gray-500">Subtotal</dt>
                  <dd class="font-medium text-gray-900">{{ tracking()?.subtotalAmount | currency:'INR':'symbol':'1.0-0' }}</dd>
                </div>
                @if (tracking()?.shippingCost) {
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Shipping</dt>
                    <dd class="font-medium text-gray-900">{{ tracking()?.shippingCost | currency:'INR':'symbol':'1.0-0' }}</dd>
                  </div>
                }
                @if (tracking()?.codFee) {
                  <div class="flex justify-between">
                    <dt class="text-gray-500">COD Fee</dt>
                    <dd class="font-medium text-gray-900">{{ tracking()?.codFee | currency:'INR':'symbol':'1.0-0' }}</dd>
                  </div>
                }
                @if (tracking()?.couponDiscount) {
                  <div class="flex justify-between text-green-600">
                    <dt>Coupon Discount</dt>
                    <dd class="font-medium">-{{ tracking()?.couponDiscount | currency:'INR':'symbol':'1.0-0' }}</dd>
                  </div>
                }
                <div class="flex justify-between pt-3 border-t border-gray-200 text-base font-bold text-gray-900">
                  <dt>Total Amount</dt>
                  <dd>{{ tracking()?.totalAmount | currency:'INR':'symbol':'1.0-0' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        }

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
  private api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  private configService = inject(ConfigService);
  orderId = signal<string>('');
  tracking = signal<OrderResponse | null>(null);
  loading = signal(true);

  baseSteps = [
    { key: 'PENDING', icon: 'receipt_long', label: 'Order Placed', description: 'We have received your order.' },
    { key: 'PAYMENT_SUCCESS', icon: 'spa', label: 'Payment Confirmed & Processing', description: 'Payment verified. Your items are being carefully prepared.' },
    { key: 'SHIPPED', icon: 'local_shipping', label: 'Shipped', description: 'Handed over to our delivery partner.' },
    { key: 'OUT_FOR_DELIVERY', icon: 'directions_bike', label: 'Out for Delivery', description: 'The package is on its way to your address.' },
    { key: 'DELIVERED', icon: 'home', label: 'Delivered', description: 'Package delivered successfully.' }
  ];

  resolvedSteps = computed(() => {
    let method = this.tracking()?.paymentMethod || 'Prepaid';
    return this.baseSteps.map(step => {
      if (step.key === 'PAYMENT_SUCCESS') {
        if (method === 'COD') {
          return { ...step, label: 'Order Confirmed & Processing (Cash on Delivery)', description: 'Order successfully locked. You will pay when you receive it.' };
        }
      }
      return step;
    });
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.orderId.set(id);
      if (id) {
        this.api.get<OrderResponse>(`/orders/${id}`).subscribe({
          next: (data) => {
            this.tracking.set(data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      }
    });
  }

  isStepReached(stepKey: string): boolean {
    const currentStatus = this.tracking()?.orderStatus;
    if (!currentStatus) return false;
    const currentIndex = STATUS_STEPS.indexOf(currentStatus as any);
    const stepIndex = STATUS_STEPS.indexOf(stepKey as any);
    return stepIndex <= currentIndex;
  }

  isCurrentStep(stepKey: string): boolean {
    return this.tracking()?.orderStatus === stepKey;
  }

  canCancel = computed(() => {
    const order = this.tracking();
    if (!order || order.orderStatus !== 'PAYMENT_SUCCESS') return false;
    
    const config = this.configService.config();
    const windowHours = config?.cancellationWindowHours || 2;
    const createdAtStr = order.createdAt;
    if (!createdAtStr) return false;
    const createdAt = new Date(createdAtStr).getTime();
    const cutoff = createdAt + (windowHours * 60 * 60 * 1000);
    return Date.now() < cutoff;
  });

  cancelOrder() {
    const id = this.orderId();
    if (!id) return;
    
    if (confirm('Are you sure you want to cancel this order? An automated refund will be initiated if payment was successful.')) {
      this.api.post(`/orders/${id}/cancel`, {}).subscribe({
        next: () => {
          this.snackbar.showSuccess('Order cancelled successfully. Refund initiated.');
          // Refresh order data
          this.ngOnInit();
        },
        error: (err: any) => this.snackbar.showError(err?.error?.message || 'Failed to cancel order')
      });
    }
  }
}


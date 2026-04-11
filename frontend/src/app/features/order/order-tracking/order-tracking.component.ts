import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ConfigService } from '../../../core/services/config.service';
import { OrderResponse, LiveTrackingResponse } from '../../../shared/models/order.model';

const STATUS_STEPS = ['PENDING', 'PAYMENT_SUCCESS', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const;

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [RouterLink, MatIconModule, CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      @if (orderNotFound()) {
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div class="px-6 py-16 text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-6">
              <mat-icon class="text-amber-500 text-4xl">search_off</mat-icon>
            </div>
            <h1 class="text-2xl font-sans font-medium text-gray-900 mb-3">Order Not Found</h1>
            <p class="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find an order with ID <strong class="font-mono text-gray-700">{{ orderId() }}</strong>. Please check the link and try again.</p>
            <div class="flex flex-col sm:flex-row justify-center gap-3">
              <a routerLink="/order/history" class="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">View My Orders</a>
              <a routerLink="/products" class="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Browse Store</a>
            </div>
          </div>
        </div>
      } @else {
      <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <!-- Header -->
        <div class="px-6 py-8 border-b border-gray-100 text-center" 
             [class.bg-gray-50]="tracking()?.orderStatus !== 'CANCELLED' && tracking()?.orderStatus !== 'REFUND_INITIATED'"
             [class.bg-red-50]="tracking()?.orderStatus === 'CANCELLED' || tracking()?.orderStatus === 'REFUND_INITIATED'">
          
          <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm"
               [class.bg-green-100]="tracking()?.orderStatus !== 'CANCELLED' && tracking()?.orderStatus !== 'REFUND_INITIATED'"
               [class.bg-red-100]="tracking()?.orderStatus === 'CANCELLED' || tracking()?.orderStatus === 'REFUND_INITIATED'">
            @if (tracking()?.orderStatus === 'CANCELLED' || tracking()?.orderStatus === 'REFUND_INITIATED') {
              <mat-icon class="text-red-600 text-3xl">cancel</mat-icon>
            } @else {
              <mat-icon class="text-dv-green text-3xl">check_circle</mat-icon>
            }
          </div>

          @if (tracking()?.orderStatus === 'CANCELLED' || tracking()?.orderStatus === 'REFUND_INITIATED') {
            <h1 class="text-3xl font-sans font-medium text-red-700 mb-2">Order Cancelled</h1>
            <p class="text-red-500">This order has been cancelled. Any payments made will be processed back to your original source.</p>
          } @else {
            <h1 class="text-3xl font-sans font-medium text-gray-900 mb-2">Order Confirmed</h1>
            <p class="text-gray-500">Thank you for your purchase. Your sacred items are being prepared.</p>
          }

          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <div class="inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <span class="text-sm text-gray-500 mr-2">Payment:</span>
              <span class="font-mono text-gray-900 font-medium">{{ tracking()?.paymentMethod || 'Prepaid' }}</span>
            </div>
            <div class="inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <span class="text-sm text-gray-500 mr-2">Order:</span>
              <span class="font-mono text-gray-900 font-bold">{{ tracking()?.orderNumber || orderId() }}</span>
            </div>
            @if (tracking()?.trackingId) {
              <div class="inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <span class="text-sm text-gray-500 mr-2">AWB:</span>
                <span class="font-mono text-gray-900 font-medium">{{ tracking()?.trackingId }}</span>
              </div>
            }
            @if (tracking()?.courierName || liveTracking()?.courierName) {
              <div class="inline-block bg-white px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/50 shadow-sm">
                <mat-icon class="text-blue-500 text-sm align-middle mr-1.5 inline">local_shipping</mat-icon>
                <span class="font-sans text-blue-800 font-medium text-sm">{{ liveTracking()?.courierName || tracking()?.courierName }}</span>
              </div>
            }
            @if (liveTracking()?.estimatedDelivery && liveTracking()?.currentStatus !== 'DELIVERED') {
              <div class="w-full mt-4">
                <span class="inline-block bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium border border-green-100">
                  Est. Delivery: {{ liveTracking()?.estimatedDelivery | date:'mediumDate' }}
                </span>
              </div>
            }
          </div>
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
            @if (tracking()?.orderStatus === 'CANCELLED' || tracking()?.orderStatus === 'REFUND_INITIATED') {
               <div class="bg-red-50/30 border border-red-100 rounded-xl p-8 text-center">
                  <mat-icon class="text-red-400 text-4xl mb-2">info</mat-icon>
                  <h3 class="text-lg font-medium text-red-900">Order Voided</h3>
                  <p class="text-sm text-red-600 mt-1">This order is no longer in progress.</p>
                  
                  @if (tracking()?.orderStatus === 'REFUND_INITIATED') {
                    <div class="mt-6 p-4 bg-white rounded-lg border border-red-100 inline-block text-left shadow-sm">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Automated Refund Info</p>
                      <p class="text-sm text-gray-700">A refund for <strong>{{ tracking()?.totalAmount | currency:'INR':'symbol':'1.0-0' }}</strong> has been initiated via Razorpay.</p>
                      <p class="text-xs text-dv-green mt-2 font-mono">Status: Processing in Bank</p>
                    </div>
                  }
               </div>
            } @else {
              <div class="relative">
                <!-- Vertical Line -->
                <div class="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>

                <div class="space-y-8 relative">
                  @if (liveTracking()?.scans && liveTracking()!.scans.length > 0) {
                    <!-- Live Shiprocket Scans -->
                    @for (scan of liveTracking()!.scans; track $index; let first = $first) {
                      <div class="flex items-start" [class.opacity-60]="!first">
                        <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-sm border-2 border-white"
                             [class.bg-dv-green]="first" [class.text-white]="first"
                             [class.bg-gray-100]="!first" [class.text-gray-500]="!first">
                          <mat-icon>{{ first ? 'location_on' : 'radio_button_checked' }}</mat-icon>
                        </div>
                        <div class="ml-6 pt-2 w-full">
                          <h3 class="text-base font-medium" [class.text-gray-900]="first" [class.text-gray-600]="!first">{{ scan.activity }}</h3>
                          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1">
                            <p class="text-sm" [class.text-gray-500]="first" [class.text-gray-400]="!first">{{ scan.location }}</p>
                            <p class="text-xs font-mono text-gray-400 mt-1 sm:mt-0">{{ scan.date | date:'MMM d, h:mm a' }}</p>
                          </div>
                          @if (first) {
                            <span class="text-xs text-dv-green mt-2 block font-medium">● Latest Update</span>
                          }
                        </div>
                      </div>
                    }
                  } @else {
                    <!-- Static Fallback Timeline -->
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
                  }
                </div>
              </div>
            }
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
      }

      <!-- Cancel Confirmation Modal -->
      @if (showCancelConfirm()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div class="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl transform transition-all">
            <div class="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-5 mx-auto">
              <mat-icon class="text-red-500 w-8 h-8 text-[32px] flex items-center justify-center">warning_amber</mat-icon>
            </div>
            <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Cancel Order?</h3>
            <p class="text-sm text-gray-500 text-center mb-6">Are you sure you want to cancel this order? This will restore item stock and initiate an automated refund if paid. This action is permanent.</p>
            <div class="flex gap-3">
              <button (click)="showCancelConfirm.set(false)" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors">Nevermind</button>
              <button (click)="executeCancel()" class="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition-colors shadow-md shadow-red-500/10">Yes, Cancel</button>
            </div>
          </div>
        </div>
      }
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
  showCancelConfirm = signal(false);

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
          return { ...step, label: 'Order Confirmed & Processing (Cash on Delivery)', description: 'Order successfully placed. You will pay when you receive it.' };
        }
      }
      return step;
    });
  });

  orderNotFound = signal(false);
  liveTracking = signal<LiveTrackingResponse | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.orderId.set(id);
      if (id) {
        this.api.get<OrderResponse>(`/orders/${id}`).subscribe({
          next: (data) => {
            this.tracking.set(data);
            this.loading.set(false);
            
            // Try fetching live tracking
            if (data.trackingId) {
                this.api.get<LiveTrackingResponse>(`/orders/${id}/live-tracking`).subscribe({
                    next: (liveData) => this.liveTracking.set(liveData),
                    error: () => console.log('Could not fetch live tracking data')
                });
            }
          },
          error: () => {
            this.orderNotFound.set(true);
            this.loading.set(false);
          }
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
    this.showCancelConfirm.set(true);
  }

  executeCancel() {
    const id = this.orderId();
    if (!id) return;
    
    this.showCancelConfirm.set(false);
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


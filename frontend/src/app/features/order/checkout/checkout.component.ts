import { Component, inject, signal, computed, OnInit, PLATFORM_ID, afterNextRender, HostListener } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart.service';
import { take } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ConfigService } from '../../../core/services/config.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ApplyCouponResponse } from '../../../shared/models/coupon.model';
import { AddressResponse } from '../../../shared/models/user.model';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, CurrencyPipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl md:text-4xl font-sans font-bold text-brand-dark mb-8">Secure Checkout</h1>

      <div class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <!-- Checkout Form -->
        <div class="lg:col-span-7">
          <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
            
            <!-- Contact Info -->
            <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
              <h2 class="text-xl font-sans font-bold text-brand-dark mb-4 flex items-center gap-2">
                <mat-icon class="text-brand-green">contact_mail</mat-icon> Contact Information
              </h2>
              <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div class="sm:col-span-2">
                  <label for="email" class="block text-sm font-medium text-brand-dark">Email address</label>
                  <div class="mt-1">
                    <input type="email" id="email" formControlName="email" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <label for="phone" class="block text-sm font-medium text-brand-dark">Phone number</label>
                  <div class="mt-1">
                    <input type="tel" id="phone" formControlName="phone" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
              <h2 class="text-xl font-sans font-bold text-brand-dark mb-4 flex items-center gap-2">
                <mat-icon class="text-brand-green">local_shipping</mat-icon> Shipping Address
              </h2>

              <!-- Saved Address Picker -->
              @if (savedAddresses().length) {
                <div class="mb-5">
                  <p class="text-sm font-medium text-brand-text mb-3">Select a saved address</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @for (addr of savedAddresses(); track addr.id) {
                      <button type="button" (click)="selectAddress(addr)" [class.ring-2]="selectedAddressId() === addr.id" [class.ring-brand-green]="selectedAddressId() === addr.id" [class.border-brand-green]="selectedAddressId() === addr.id" class="text-left border border-gray-200 rounded-lg p-3 hover:border-brand-green transition-all cursor-pointer relative">
                        @if (addr.isDefault) {
                          <span class="absolute top-2 right-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Default</span>
                        }
                        <p class="font-medium text-brand-dark text-sm">{{ addr.label || 'Address' }}</p>
                        <p class="text-xs text-brand-text mt-1">{{ addr.line1 }}{{ addr.line2 ? ', ' + addr.line2 : '' }}</p>
                        <p class="text-xs text-brand-text">{{ addr.city }}, {{ addr.state }} — {{ addr.postalCode }}</p>
                      </button>
                    }
                    <button type="button" (click)="clearSelectedAddress()" [class.ring-2]="!selectedAddressId()" [class.ring-brand-green]="!selectedAddressId()" [class.border-brand-green]="!selectedAddressId()" class="text-left border border-dashed border-gray-300 rounded-lg p-3 hover:border-brand-green transition-all cursor-pointer flex items-center justify-center gap-2 text-sm text-brand-text">
                      <mat-icon class="text-[18px]">add</mat-icon> Enter new address
                    </button>
                  </div>
                </div>
              }

              <div class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-brand-dark">First name</label>
                  <div class="mt-1">
                    <input type="text" id="firstName" formControlName="firstName" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>

                <div>
                  <label for="lastName" class="block text-sm font-medium text-brand-dark">Last name</label>
                  <div class="mt-1">
                    <input type="text" id="lastName" formControlName="lastName" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label for="address" class="block text-sm font-medium text-brand-dark">Address</label>
                  <div class="mt-1">
                    <input type="text" id="address" formControlName="address" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>

                <div>
                  <label for="city" class="block text-sm font-medium text-brand-dark">City</label>
                  <div class="mt-1">
                    <input type="text" id="city" formControlName="city" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>

                <div>
                  <label for="state" class="block text-sm font-medium text-brand-dark">State / Province</label>
                  <div class="mt-1">
                    <input type="text" id="state" formControlName="state" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>

                <div>
                  <label for="postalCode" class="block text-sm font-medium text-brand-dark">Postal code</label>
                  <div class="mt-1">
                    <input type="text" id="postalCode" formControlName="postalCode" class="block w-full rounded-md border-gray-300 bg-white text-brand-dark shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm p-2.5 border">
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
              <h2 class="text-xl font-sans font-bold text-brand-dark mb-4 flex items-center gap-2">
                <mat-icon class="text-brand-green">payment</mat-icon> Payment Method
              </h2>
              <div class="space-y-4">
                <div class="flex items-center">
                  <input id="payment-razorpay" name="paymentOption" (change)="paymentType.set('Prepaid')" type="radio" checked class="h-4 w-4 border-gray-300 text-brand-green focus:ring-brand-green bg-white">
                  <label for="payment-razorpay" class="ml-3 block text-sm font-medium text-brand-dark">
                    Razorpay (UPI, Cards, NetBanking)
                  </label>
                </div>
                <div class="flex items-center">
                  <input id="payment-cod" name="paymentOption" (change)="paymentType.set('COD')" type="radio" class="h-4 w-4 border-gray-300 text-brand-green focus:ring-brand-green bg-white">
                  <label for="payment-cod" class="ml-3 block text-sm font-medium text-brand-dark">
                    Cash on Delivery (Pay when you receive)
                  </label>
                </div>
              </div>
            </div>

          </form>
        </div>

        <!-- Order Summary -->
        <div class="mt-10 lg:mt-0 lg:col-span-5">
          <div class="bg-brand-gray border border-gray-100 rounded-lg px-4 py-6 sm:p-6 lg:p-8 sticky top-24 shadow-sm">
            <h2 class="text-lg font-sans font-bold text-brand-dark mb-6">Order Summary</h2>

            <div class="mb-4 flex gap-2">
              <input [formControl]="couponCode" placeholder="Coupon code" class="flex-1 border rounded-md px-3 py-2 text-sm"/>
              <button type="button" (click)="applyCoupon()" class="px-3 py-2 border rounded-md text-sm">Apply</button>
            </div>

            <!-- Dynamically Rendered Active Coupons list -->
            @if(activeCoupons().length > 0) {
              <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for(coupon of activeCoupons(); track coupon.id) {
                  <button type="button" 
                          (click)="couponCode.setValue(coupon.code); applyCoupon()" 
                          class="p-3 text-left border border-brand-green/30 bg-brand-green/5 text-brand-green rounded-lg hover:bg-brand-green hover:text-white transition-all group">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold uppercase tracking-wide group-hover:text-white mb-0.5">{{ coupon.code }}</span>
                      <span class="text-[10px] font-bold opacity-60 group-hover:text-white/80">
                        @if(coupon.type === 'PERCENTAGE') { {{ coupon.discountValue }}% OFF }
                        @else if(coupon.type === 'FIXED') { ₹{{ coupon.discountValue }} OFF }
                        @else if(coupon.type === 'BXGX') { BUY {{ coupon.buyQty }} GET {{ coupon.getQty }} FREE }
                      </span>
                      @if(coupon.minimumCartValue > 0) {
                        <span class="text-[10px] mt-1 italic opacity-60 group-hover:text-white/70">Min items: {{ coupon.minimumCartValue | currency:'INR':'symbol':'1.0-0' }}</span>
                      }
                    </div>
                  </button>
                }
              </div>
            }

            <div class="flow-root mb-6">
              <ul role="list" class="-my-4 divide-y divide-gray-200">
                @for (item of displayItems(); track (item.cartItemId + '-' + item.isFree)) {
                <li class="flex py-4">
                  <div class="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden relative">
                    <img [src]="item.imageUrl || 'assets/images/placeholder-product.webp'" alt="Product" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                    @if(item.isFree) {
                      <div class="absolute inset-0 bg-brand-green/20 flex items-center justify-center">
                         <span class="text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded font-black uppercase">Free</span>
                      </div>
                    }
                  </div>
                  <div class="ml-4 flex-1 flex flex-col">
                    <div>
                      <div class="flex justify-between text-sm font-medium text-brand-dark">
                        <h3 class="font-sans flex items-center gap-2">
                          {{ item.productName }}
                          @if(item.isFree) {
                            <span class="text-[10px] text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded-full uppercase">🎁 Free Gift</span>
                          }
                        </h3>
                        <p class="text-brand-dark font-bold" [class.text-brand-green]="item.isFree">
                          {{ item.totalPrice | currency:'INR':'symbol':'1.0-0' }}
                        </p>
                      </div>
                    </div>
                    <div class="flex-1 flex items-end justify-between text-sm">
                      <p class="text-brand-text">Qty {{ item.quantity }}</p>
                    </div>
                  </div>
                </li>
                }
              </ul>
            </div>

            <dl class="space-y-4 text-sm text-brand-text pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <dt>Subtotal</dt>
                <dd class="font-medium text-brand-dark">{{ subtotal() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt>Shipping</dt>
                <dd class="font-medium text-brand-dark">{{ shipping() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
              @if (codFeeAmount() > 0) {
              <div class="flex items-center justify-between">
                <dt>Cash on Delivery Fee</dt>
                <dd class="font-medium text-brand-dark">{{ codFeeAmount() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
              }
              @if (couponDiscount() > 0) {
              <div class="flex items-center justify-between">
                <dt>Coupon Discount</dt>
                <dd class="font-medium text-green-700">- {{ couponDiscount() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
              }
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <dt class="text-base font-bold text-brand-dark">Total</dt>
                <dd class="text-xl font-bold text-brand-dark">{{ finalTotal() | currency:'INR':'symbol':'1.0-0' }}</dd>
              </div>
            </dl>

            <div class="mt-8">
              <button 
                type="submit"
                [disabled]="checkoutForm.invalid || isProcessing()"
                class="w-full bg-brand-green text-white py-4 px-4 rounded-sm font-medium uppercase tracking-wider hover:bg-brand-green-dark transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                @if (isProcessing()) {
                  <mat-icon class="animate-spin text-sm">refresh</mat-icon>
                  Processing...
                } @else {
                  {{ paymentType() === 'COD' ? 'Order Now!' : 'Pay Securely' }}
                  <mat-icon class="text-sm">{{ paymentType() === 'COD' ? 'shopping_basket' : 'lock' }}</mat-icon>
                }
              </button>
            </div>
            <p class="mt-4 text-xs text-center text-brand-text flex items-center justify-center gap-1">
              <mat-icon class="text-[14px]">security</mat-icon>
              Payments are secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private activeOrderId: string | null = null;
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private cartService = inject(CartService);
  private api = inject(ApiService);
  private configService = inject(ConfigService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  isProcessing = signal(false);
  savedAddresses = signal<AddressResponse[]>([]);
  activeCoupons = signal<any[]>([]);
  selectedAddressId = signal<string | null>(null);
  paymentType = signal('Prepaid');
  couponCode = this.fb.control('');
  couponDiscount = signal(0);
  appliedCouponData = signal<ApplyCouponResponse | null>(null);
  cartItems = this.cartService.items;
  private isPaymentSuccessful = false;
  
  // Refactor: Subtotal now reflects items after free-gift split
  subtotal = computed(() => this.displayItems().reduce((sum, item) => sum + item.totalPrice, 0));
  
  // Original subtotal used for shipping threshold calculations
  originalSubtotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0));

  displayItems = computed(() => {
    const items = this.cartItems();
    const couponData = this.appliedCouponData();
    if (!couponData || !couponData.targetProductId || !couponData.freeQuantity) {
      return items.map(i => ({ ...i, isFree: false }));
    }

    const result: any[] = [];
    items.forEach(item => {
      if (item.productId === couponData.targetProductId) {
        const freeQty = Math.min(item.quantity, couponData.freeQuantity || 0);
        const paidQty = item.quantity - freeQty;

        if (paidQty > 0) {
          result.push({
            ...item,
            quantity: paidQty,
            totalPrice: item.unitPrice * paidQty,
            isFree: false
          });
        }
        if (freeQty > 0) {
          result.push({
            ...item,
            productName: `${item.productName}`,
            quantity: freeQty,
            totalPrice: 0,
            isFree: true
          });
        }
      } else {
        result.push({ ...item, isFree: false });
      }
    });
    return result;
  });

  shipping = computed(() => {
    const config = this.configService.config();
    if (!config) return 0;
    // Shipping is usually based on the original subtotal (pre-gift deduction) 
    // to be fair to users if they add a gift that is technically free but counts towards the weight.
    // However, if the user wants it based on what they pay, use subtotal().
    return this.originalSubtotal() >= config.freeShippingThreshold ? 0 : config.standardShippingCost;
  });

  codFeeAmount = computed(() => {
    if (this.paymentType() === 'COD') {
      return this.configService.config()?.codFee || 0;
    }
    return 0;
  });

  finalTotal = computed(() => {
    const s = this.subtotal();
    const d = this.couponDiscount();
    const sh = this.shipping();
    const cf = this.codFeeAmount();
    return Math.max(0, s + sh + cf - d);
  });

  checkoutForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
  });

  constructor() {
    // Fetch saved addresses and auto-select default safely in browser only
    afterNextRender(() => {
      this.api.get<AddressResponse[]>('/user/addresses').subscribe({
        next: (addresses) => {
          this.savedAddresses.set(addresses);
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          if (defaultAddr) {
            this.selectAddress(defaultAddr);
          }
        }
      });
      // Fetch available active coupons smartly
      this.api.get<any[]>('/coupons/active').subscribe({
        next: (coupons) => {
          this.activeCoupons.set(coupons);
        }
      });
    });
  }

  ngOnInit() {
    const profile = this.authService.currentUser();
    if (profile) {
      let fName = profile.name || '';
      let lName = '';
      if (fName.includes(' ')) {
        const parts = fName.split(' ');
        fName = parts[0];
        lName = parts.slice(1).join(' ');
      }
      this.checkoutForm.patchValue({
        email: profile.email || '',
        phone: profile.phone || '',
        firstName: fName,
        lastName: lName
      });
    }
  }

  selectAddress(addr: AddressResponse) {
    this.selectedAddressId.set(addr.id);
    const line = [addr.line1, addr.line2].filter(Boolean).join(', ');
    this.checkoutForm.patchValue({
      address: line,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode
    });
  }

  clearSelectedAddress() {
    this.selectedAddressId.set(null);
    this.checkoutForm.patchValue({
      address: '',
      city: '',
      state: '',
      postalCode: ''
    });
  }

  placeOrder() {
    if (this.isProcessing()) return; // Lock the method immediately to prevent any re-triggers
    if (this.checkoutForm.valid) {
      this.isProcessing.set(true);
      this.isPaymentSuccessful = false; // Reset for a new attempt
      const isCod = this.paymentType() === 'COD';
      
      const req = {
        ...this.checkoutForm.value,
        paymentMethod: isCod ? 'COD' : 'Prepaid',
        couponCode: this.couponCode.value?.trim() || null
      };

      // Stage 1: Lock Order in the DB
      this.api.post<any>('/orders', req).subscribe({
        next: (orderRes) => {
          this.activeOrderId = orderRes.id;
          if (isCod) {
            this.isProcessing.set(false);
            this.snackbar.showSuccess('Order placed successfully via Cash on Delivery!');
            this.router.navigate(['/order/tracking', orderRes.id]);
            return;
          }

          // Stage 2: Prepare Razorpay Transaction Hash
          this.api.post<any>(`/orders/${orderRes.id}/payment-order`, {}).subscribe({
            next: (rpRes) => {
              // Stage 3: Fetch Public Key dynamically and boot Razorpay overlay
              this.api.get<any>('/orders/razorpay-key').subscribe({
                next: (keyRes) => {
                  this.openRazorpay(orderRes.id, rpRes.razorpayOrderId, orderRes.totalAmount, keyRes.key, req);
                },
                error: () => this.failPayment('System error. Razorpay Key not found.')
              });
            },
            error: () => this.failPayment('Failed to initiate secure payment gateway.')
          });
        },
        error: () => this.failPayment('Failed to secure order. Cart might be empty or items out of stock.')
      });
    } else {
      this.checkoutForm.markAllAsTouched();
      this.snackbar.showError('Please fill all required fields correctly.');
    }
  }

  private openRazorpay(orderId: string, rpOrderId: string, amount: number, key: string, userReq: any) {
    this.loadRazorpayScript().then(() => {
      console.log('[Razorpay] Opening checkout with order_id:', rpOrderId, 'amount:', amount);
      const options = {
        key: key,
        amount: amount * 100, // Paise
        currency: 'INR',
        name: 'Devine Vibes',
        description: 'Luxury Spiritual Items',
        order_id: rpOrderId,
        prefill: {
          name: userReq.firstName + ' ' + userReq.lastName,
          email: userReq.email,
          contact: userReq.phone
        },
        theme: {
          color: '#2D5A47'
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay] Modal dismissed/cancelled by user.');
            this.handlePaymentCancellation(orderId);
          }
        },
        handler: (response: any) => {
          console.log('[Razorpay] Success callback:', JSON.stringify(response));
          this.api.post(`/orders/${orderId}/verify`, {
            razorpayOrderId: response.razorpay_order_id || rpOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature || ''
          }).subscribe({
            next: () => {
              this.isPaymentSuccessful = true; // Block cancellation logic from firing
              this.isProcessing.set(false);
              this.cartService.loadCart(); // Refresh cart to show it's now empty
              this.snackbar.showSuccess('Payment Successful! Order has been dispatched.');
              this.router.navigate(['/order/tracking', orderId]);
            },
            error: () => this.failPayment('Payment Signature Validation Failed! Contact Support.')
          });
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('[Razorpay] Payment Failed', response.error);
        this.handlePaymentCancellation(orderId);
        this.failPayment('Payment failed: ' + (response.error?.description || 'Transaction declined.'));
      });
      rzp.open();
    }).catch(() => {
      this.failPayment('Failed to load payment gateway. Please check your internet connection.');
    });
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use an ID check to ensure we only load the script ONCE on the page
      if (document.getElementById('rzp-checkout-script') || typeof Razorpay !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'rzp-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  private handlePaymentCancellation(orderId: string) {
    // If the payment was successful, ignore the modal close event
    if (this.isPaymentSuccessful) return;

    this.isProcessing.set(false);
    this.api.post(`/orders/${orderId}/cancel`, {}).subscribe({
      next: () => {
        this.snackbar.showInfo('Transaction cancelled. Your items are still in your cart.');
      },
      error: () => {
        console.error('Failed to explicitly cancel order. Background task will handle cleanup.');
      }
    });
  }

  private failPayment(msg: string) {
    this.isProcessing.set(false);
    this.snackbar.showError(msg);
  }

  applyCoupon() {
    const code = this.couponCode.value?.trim();
    if (!code) return;
    const quantity = this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
    this.api.post<ApplyCouponResponse>('/coupons/apply', { code, cartTotal: this.subtotal(), quantity }).subscribe({
      next: (res) => {
        if (res.productIdToAdd) {
          this.snackbar.showSuccess('Adding eligible free items to your cart...');
          this.cartService.addToCartById(res.productIdToAdd, res.quantityToAdd || 1);
          // Recursion removed: Stopping background "auto-apply" spam to prevent infinite loops
          return;
        }
        if (res.targetProductId && res.freeQuantity) {
          this.couponDiscount.set(0); // For BXGX, discount is shown on the item line (₹0)
        } else {
          this.couponDiscount.set(res.discountAmount);
        }
        this.appliedCouponData.set(res);
        this.snackbar.showSuccess(res.message);
      },
      error: (err) => this.snackbar.showError(err?.error?.message || 'Invalid coupon')
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isProcessing() && !this.isPaymentSuccessful && this.activeOrderId) {
      // Use sendBeacon to guarantee delivery during page unload
      const backendUrl = this.router.url.includes('localhost') ? 'http://localhost:8080' : 'https://api.devinevibes.in';
      const cancelUrl = `${backendUrl}/api/orders/${this.activeOrderId}/cancel`;
      
      const authService = inject(AuthService);
      const token = authService.getAccessToken();
      
      if (token) {
        // synchronously send cancel request
        try {
          fetch(cancelUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            keepalive: true
          });
        } catch (e) {}
      }
    }
  }
}

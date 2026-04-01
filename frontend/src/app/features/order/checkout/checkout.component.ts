import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
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
                  <input id="payment-razorpay" name="paymentMethod" type="radio" checked class="h-4 w-4 border-gray-300 text-brand-green focus:ring-brand-green bg-white">
                  <label for="payment-razorpay" class="ml-3 block text-sm font-medium text-brand-dark">
                    Razorpay (UPI, Cards, NetBanking)
                  </label>
                </div>
                <div class="flex items-center">
                  <input id="payment-cod" name="paymentMethod" type="radio" disabled class="h-4 w-4 border-gray-300 text-brand-green focus:ring-brand-green bg-gray-100 opacity-50 cursor-not-allowed">
                  <label for="payment-cod" class="ml-3 block text-sm font-medium text-gray-400">
                    Cash on Delivery (Not available for your location)
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

            <div class="flow-root mb-6">
              <ul role="list" class="-my-4 divide-y divide-gray-200">
                <li class="flex py-4">
                  <div class="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                    <img src="https://picsum.photos/seed/1/100/100" alt="Product" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                  </div>
                  <div class="ml-4 flex-1 flex flex-col">
                    <div>
                      <div class="flex justify-between text-sm font-medium text-brand-dark">
                        <h3 class="font-sans">5 Mukhi Rudraksha Mala</h3>
                        <p class="text-brand-dark font-bold">₹1,500</p>
                      </div>
                    </div>
                    <div class="flex-1 flex items-end justify-between text-sm">
                      <p class="text-brand-text">Qty 1</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <dl class="space-y-4 text-sm text-brand-text pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <dt>Subtotal</dt>
                <dd class="font-medium text-brand-dark">₹1,500</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt>Shipping</dt>
                <dd class="font-medium text-brand-dark">₹150</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt>Tax (18%)</dt>
                <dd class="font-medium text-brand-dark">₹270</dd>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <dt class="text-base font-bold text-brand-dark">Total</dt>
                <dd class="text-xl font-bold text-brand-dark">₹1,920</dd>
              </div>
            </dl>

            <div class="mt-8">
              <button 
                (click)="placeOrder()"
                [disabled]="checkoutForm.invalid || isProcessing()"
                class="w-full bg-brand-green text-white py-4 px-4 rounded-sm font-medium uppercase tracking-wider hover:bg-brand-green-dark transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                @if (isProcessing()) {
                  <mat-icon class="animate-spin text-sm">refresh</mat-icon>
                  Processing...
                } @else {
                  Pay Securely
                  <mat-icon class="text-sm">lock</mat-icon>
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
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  isProcessing = signal(false);

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

  placeOrder() {
    if (this.checkoutForm.valid) {
      this.isProcessing.set(true);
      
      // Mock Razorpay flow
      setTimeout(() => {
        this.isProcessing.set(false);
        this.snackbar.showSuccess('Order placed successfully! Payment verified.');
        // Generate a random order ID for demo
        const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
        this.router.navigate(['/order/tracking', orderId]);
      }, 2000);
    } else {
      this.checkoutForm.markAllAsTouched();
      this.snackbar.showError('Please fill all required fields correctly.');
    }
  }
}

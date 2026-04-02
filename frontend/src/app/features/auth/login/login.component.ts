import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Router, RouterLink } from '@angular/router';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
        <div>
          <div class="w-16 h-16 mx-auto rounded-full border border-brand-green/20 flex items-center justify-center bg-brand-green/5">
            <mat-icon class="text-brand-green text-3xl">self_improvement</mat-icon>
          </div>
          <h2 class="mt-6 text-center text-3xl font-sans font-bold text-brand-dark">
            Welcome Back
          </h2>
          <p class="mt-2 text-center text-sm text-brand-text">
            Sign in to access your sacred journey
          </p>
        </div>

        @if (!otpSent()) {
          <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-md">
            <button type="button" (click)="switchMode('phone')" [class.bg-white]="mode() === 'phone'" class="py-2 rounded text-sm font-medium">Phone OTP</button>
            <button type="button" (click)="switchMode('email')" [class.bg-white]="mode() === 'email'" class="py-2 rounded text-sm font-medium">Email OTP</button>
          </div>
          <form class="mt-8 space-y-6" [formGroup]="mode() === 'phone' ? phoneForm : emailForm" (ngSubmit)="requestOtp()">
            <div>
              <label for="name" class="block text-sm font-medium text-brand-dark mb-2">Full Name</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green sm:text-sm transition-colors"
                placeholder="Enter your full name"
              >
            </div>
            @if (mode() === 'phone') {
            <div>
              <label for="phone" class="block text-sm font-medium text-brand-dark mb-2">Phone Number</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-text">+91</span>
                <input 
                  id="phone" 
                  type="tel" 
                  formControlName="phone"
                  class="appearance-none rounded-md relative block w-full px-3 py-3 pl-12 border border-gray-300 bg-white text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green sm:text-sm transition-colors" 
                  placeholder="Enter your mobile number"
                  maxlength="10"
                >
              </div>
              @if (phoneForm.get('phone')?.touched && phoneForm.get('phone')?.invalid) {
                <p class="mt-2 text-xs text-red-500">Please enter a valid 10-digit phone number.</p>
              }
            </div>
            } @else {
            <div>
              <label for="email" class="block text-sm font-medium text-brand-dark mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green sm:text-sm transition-colors"
                placeholder="you@example.com"
              >
              @if (emailForm.get('email')?.touched && emailForm.get('email')?.invalid) {
                <p class="mt-2 text-xs text-red-500">Please enter a valid email address.</p>
              }
            </div>
            }

            <div>
              <button 
                type="submit" 
                [disabled]="(mode() === 'phone' ? phoneForm.invalid : emailForm.invalid) || isLoading()"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider shadow-md"
              >
                @if (isLoading()) {
                  <mat-icon class="animate-spin mr-2 text-sm">refresh</mat-icon>
                  Sending...
                } @else {
                  Get OTP
                }
              </button>
            </div>
            
            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-brand-text">Or continue with</span>
                </div>
              </div>

              <div class="mt-6">
                <button 
                  type="button"
                  (click)="loginWithGoogle()"
                  class="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-brand-dark hover:bg-gray-50 transition-colors"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5">
                  Sign in with Google
                </button>
              </div>
            </div>
            
            <div class="mt-6 text-center">
              <p class="text-sm text-brand-text">
                Don't have an account? 
                <a routerLink="/auth/register" class="font-medium text-brand-green hover:text-brand-green-dark transition-colors">Register here</a>
              </p>
            </div>
          </form>
        } @else {
          <form class="mt-8 space-y-6" [formGroup]="otpForm" (ngSubmit)="verifyOtp()">
            <div>
              <label for="otp" class="block text-sm font-medium text-brand-dark mb-2">Enter OTP</label>
              <p class="text-xs text-brand-text mb-4">Sent to {{ mode() === 'phone' ? ('+91 ' + phoneForm.value.phone) : emailForm.value.email }} <button type="button" (click)="otpSent.set(false)" class="text-brand-green hover:underline ml-2">Change</button></p>
              <input 
                id="otp" 
                type="text" 
                formControlName="otp"
                class="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-white text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green sm:text-sm text-center tracking-[0.5em] text-lg transition-colors" 
                placeholder="••••••"
                maxlength="6"
              >
              @if (otpForm.get('otp')?.touched && otpForm.get('otp')?.invalid) {
                <p class="mt-2 text-xs text-red-500">Please enter a valid 6-digit OTP.</p>
              }
            </div>

            <div>
              <button 
                type="submit" 
                [disabled]="otpForm.invalid || isLoading()"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider shadow-md"
              >
                @if (isLoading()) {
                  <mat-icon class="animate-spin mr-2 text-sm">refresh</mat-icon>
                  Verifying...
                } @else {
                  Verify & Login
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);

  phoneForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  emailForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  mode = signal<'phone' | 'email'>('phone');
  otpSent = signal(false);
  isLoading = signal(false);

  requestOtp() {
    const isPhoneMode = this.mode() === 'phone';
    const form = isPhoneMode ? this.phoneForm : this.emailForm;
    if (form.valid) {
      this.isLoading.set(true);
      const name = form.value.name!;
      const phone = this.phoneForm.value.phone || undefined;
      const email = this.emailForm.value.email || undefined;

      this.authService.requestOtp({ phone, email, name }).subscribe({
        next: () => {
          this.otpSent.set(true);
          this.isLoading.set(false);
          this.snackbar.showSuccess('OTP sent successfully');
        },
        error: () => {
          this.isLoading.set(false);
          this.snackbar.showError('Unable to send OTP. Please check the phone number and try again.');
        }
      });
    }
  }

  verifyOtp() {
    const form = this.mode() === 'phone' ? this.phoneForm : this.emailForm;
    if (this.otpForm.valid && form.valid) {
      this.isLoading.set(true);
      const phone = this.phoneForm.value.phone || undefined;
      const email = this.emailForm.value.email || undefined;
      const name = form.value.name!;
      const otp = this.otpForm.value.otp!;
      
      this.authService.verifyOtp({ phone, email, name, otp }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.cartService.mergeGuestCartAfterLogin();
          this.snackbar.showSuccess('Login successful');
          this.router.navigate(['/']);
        },
        error: () => {
          this.isLoading.set(false);
          this.snackbar.showError('Invalid OTP. Please try again.');
        }
      });
    }
  }

  loginWithGoogle() {
    if (!environment.googleClientId) {
      this.snackbar.showError('Google login is not configured. Missing Google client ID.');
      return;
    }

    this.ensureGoogleScript()
      .then(() => {
        if (!window.google?.accounts?.id) {
          throw new Error('Google Identity Services unavailable');
        }

        window.google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: ({ credential }) => {
            this.authService.loginWithGoogle({ idToken: credential }).subscribe({
              next: () => {
                this.cartService.mergeGuestCartAfterLogin();
                this.snackbar.showSuccess('Google login successful');
                this.router.navigate(['/']);
              }
            });
          }
        });

        window.google.accounts.id.prompt();
      })
      .catch(() => {
        this.snackbar.showError('Unable to start Google login.');
      });
  }

  private ensureGoogleScript(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-google-identity="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('load error')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset['googleIdentity'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('load error'));
      document.head.appendChild(script);
    });
  }

  switchMode(mode: 'phone' | 'email') {
    this.mode.set(mode);
    this.otpSent.set(false);
    this.otpForm.reset();
  }
}

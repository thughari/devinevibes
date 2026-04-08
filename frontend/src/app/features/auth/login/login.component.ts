import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';
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
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#faf9f6]">
      <!-- Background Decorative Elements -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl"></div>
      </div>
      
      <div class="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative z-10 transition-all duration-500">
        <div class="text-center">
          <div class="inline-flex p-1 rounded-full bg-brand-green/5 border border-brand-green/10 mb-6 drop-shadow-sm group hover:scale-105 transition-transform duration-500">
            <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-white group-hover:rotate-[360deg] transition-transform duration-1000">
              <mat-icon class="text-brand-green text-4xl">self_improvement</mat-icon>
            </div>
          </div>
          <h2 class="text-3xl md:text-4xl font-serif font-bold text-brand-dark tracking-tight">
            Sacred Journey
          </h2>
          <p class="mt-3 text-brand-text text-sm font-medium opacity-80 max-w-[280px] mx-auto italic">
            "Your path to holistic spiritual lifestyle begins with a single step."
          </p>
        </div>

        @if (!otpSent()) {
          <div class="space-y-6 animate-fadeIn">
            <!-- Google Login - Most Prominent -->
            <button 
              type="button"
              (click)="loginWithGoogle()"
              class="w-full flex justify-center items-center gap-4 py-4 px-6 border border-gray-100 rounded-2xl shadow-sm bg-white text-sm font-bold text-brand-dark hover:shadow-md hover:border-brand-green/20 active:scale-[0.98] transition-all duration-300"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-6 h-6">
              Continue with Google
            </button>

            <div class="relative py-4">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-100"></div>
              </div>
              <div class="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-gray-400">
                <span class="px-4 bg-white/0">or explore with OTP</span>
              </div>
            </div>

            <!-- OTP Tabs -->
            <div class="flex p-1 bg-gray-50/50 border border-gray-100 rounded-xl mb-6 shadow-inner">
              <button 
                type="button" 
                (click)="switchMode('email')" 
                [class.bg-white]="mode() === 'email'" 
                [class.shadow-sm]="mode() === 'email'"
                [class.text-brand-green]="mode() === 'email'"
                class="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 text-gray-400"
              >
                Email
              </button>
              <button 
                type="button" 
                (click)="switchMode('phone')" 
                [class.bg-white]="mode() === 'phone'" 
                [class.shadow-sm]="mode() === 'phone'"
                [class.text-brand-green]="mode() === 'phone'"
                class="flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 text-gray-400"
              >
                Phone
              </button>
            </div>

            <form class="space-y-5" [formGroup]="mode() === 'phone' ? phoneForm : emailForm" (ngSubmit)="requestOtp()">
              <div class="group">
                <label class="block text-[11px] font-black uppercase tracking-widest text-brand-text mb-2 pl-1">Full Name</label>
                <div class="relative">
                  <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-[20px] transition-colors group-focus-within:text-brand-green">person_outline</mat-icon>
                  <input
                    type="text"
                    formControlName="name"
                    class="block w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 text-brand-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:bg-white transition-all placeholder:text-gray-300"
                    placeholder="Enter your name"
                  >
                </div>
              </div>

              @if (mode() === 'phone') {
                <div class="group animate-slideDown">
                  <label class="block text-[11px] font-black uppercase tracking-widest text-brand-text mb-2 pl-1">Phone Number</label>
                  <div class="relative">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-gray-200">
                      <span class="text-xs font-bold text-brand-dark">+91</span>
                    </div>
                    <input 
                      type="tel" 
                      formControlName="phone"
                      class="block w-full pl-[4.5rem] pr-4 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 text-brand-dark font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:bg-white transition-all placeholder:text-gray-300" 
                      placeholder="9876543210"
                      maxlength="10"
                    >
                  </div>
                  @if (phoneForm.get('phone')?.touched && phoneForm.get('phone')?.invalid) {
                    <p class="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">Invalid phone format</p>
                  }
                </div>
              } @else {
                <div class="group animate-slideDown">
                  <label class="block text-[11px] font-black uppercase tracking-widest text-brand-text mb-2 pl-1">Email Address</label>
                  <div class="relative">
                    <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-[20px] transition-colors group-focus-within:text-brand-green">mail_outline</mat-icon>
                    <input
                      type="email"
                      formControlName="email"
                      class="block w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 text-brand-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green focus:bg-white transition-all placeholder:text-gray-300"
                      placeholder="you@example.com"
                    >
                  </div>
                  @if (emailForm.get('email')?.touched && emailForm.get('email')?.invalid) {
                    <p class="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">Invalid email format</p>
                  }
                </div>
              }

              <button 
                type="submit" 
                [disabled]="(mode() === 'phone' ? phoneForm.invalid : emailForm.invalid) || isLoading()"
                class="w-full flex justify-center py-4 px-6 rounded-2xl bg-brand-green text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-brand-green/30 hover:bg-brand-green-dark hover:shadow-brand-green/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 mt-8"
              >
                @if (isLoading()) {
                  <mat-icon class="animate-spin mr-3 scale-90">refresh</mat-icon> Transmitting...
                } @else {
                  Begin Journey
                }
              </button>
            </form>

            <p class="mt-10 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              New to Devine Vibes? <br>
              <span class="text-brand-dark opacity-100">Sign up auto-happens on your first login.</span>
            </p>
          </div>
        } @else {
          <div class="space-y-8 animate-fadeIn">
            <div class="text-center">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/5 border border-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest mb-4">
                <mat-icon class="text-[14px] w-3.5 h-3.5">verified_user</mat-icon>
                Verification Sent
              </div>
              <p class="text-sm text-brand-text opacity-70">
                A 6-digit code has been sent to<br>
                <span class="font-bold text-brand-dark">{{ mode() === 'phone' ? ('+91 ' + phoneForm.value.phone) : emailForm.value.email }}</span>
              </p>
            </div>

            <form class="space-y-6" [formGroup]="otpForm" (ngSubmit)="verifyOtp()">
              <div class="flex flex-col items-center gap-4">
                <input 
                  type="text" 
                  formControlName="otp"
                  class="block w-full max-w-[280px] px-4 py-5 rounded-2xl bg-gray-50 border-2 border-transparent text-center font-mono text-3xl font-black tracking-[0.5em] text-brand-green focus:outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green focus:bg-white transition-all shadow-inner" 
                  placeholder="••••••"
                  maxlength="6"
                  #otpInput
                  (focus)="snackbar.showInfo('Enter the 6-digit code')"
                >
                @if (otpForm.get('otp')?.touched && otpForm.get('otp')?.invalid) {
                  <p class="text-[10px] text-red-500 font-black uppercase tracking-widest">Enter exactly 6 digits</p>
                }
              </div>

              <div class="space-y-3">
                <button 
                  type="submit" 
                  [disabled]="otpForm.invalid || isLoading()"
                  class="w-full flex justify-center py-4 px-6 rounded-2xl bg-brand-green text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-brand-green/30 hover:bg-brand-green-dark hover:shadow-brand-green/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                >
                  @if (isLoading()) {
                    <mat-icon class="animate-spin mr-3 scale-90">refresh</mat-icon> Verifying...
                  } @else {
                    Enter Sanctuary
                  }
                </button>
                <button type="button" (click)="otpSent.set(false)" class="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-dark transition-colors">
                  Wrong Details? Go Back
                </button>
              </div>
            </form>
          </div>
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
  protected snackbar = inject(SnackbarService);

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

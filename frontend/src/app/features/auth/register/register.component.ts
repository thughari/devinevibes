import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center">
          <mat-icon class="text-dv-green text-5xl">spa</mat-icon>
        </div>
        <h2 class="mt-6 text-center text-3xl font-sans font-medium text-gray-900">
          Create an account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <a routerLink="/auth/login" class="font-medium text-dv-green hover:text-green-700">
            sign in to your existing account
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <form class="space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px]">person</mat-icon>
                </div>
                <input id="name" type="text" formControlName="name"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-dv-green focus:border-dv-green sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="John Doe">
              </div>
              @if (registerForm.get('name')?.touched && registerForm.get('name')?.invalid) {
                <p class="mt-2 text-sm text-red-600">Name is required</p>
              }
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px]">email</mat-icon>
                </div>
                <input id="email" type="email" formControlName="email"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-dv-green focus:border-dv-green sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="you@example.com">
              </div>
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                <p class="mt-2 text-sm text-red-600">Please enter a valid email</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px]">lock</mat-icon>
                </div>
                <input [type]="showPassword() ? 'text' : 'password'" id="password" formControlName="password"
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-dv-green focus:border-dv-green sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="••••••••">
                <button type="button" (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500">
                  <mat-icon class="text-[20px]">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                <p class="mt-2 text-sm text-red-600">Password must be at least 6 characters</p>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px]">lock</mat-icon>
                </div>
                <input [type]="showPassword() ? 'text' : 'password'" id="confirmPassword" formControlName="confirmPassword"
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-dv-green focus:border-dv-green sm:text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder="••••••••">
              </div>
              @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                <p class="mt-2 text-sm text-red-600">Passwords do not match</p>
              }
            </div>

            @if (error()) {
              <div class="rounded-md bg-red-50 p-4 border border-red-200">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <mat-icon class="text-red-400">error</mat-icon>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">{{ error() }}</h3>
                  </div>
                </div>
              </div>
            }

            <div>
              <button type="submit" [disabled]="registerForm.invalid || isLoading()"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-dv-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dv-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                @if (isLoading()) {
                  <mat-icon class="animate-spin mr-2">refresh</mat-icon>
                  Creating account...
                } @else {
                  Create account
                }
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <div class="mt-6 flex justify-center w-full">
              <div id="google-btn-container" class="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full min-h-[44px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private cartService = inject(CartService);

  showPassword = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    this.initGoogleLogin();
  }

  private initGoogleLogin() {
    if (!environment.googleClientId) {
      console.warn('Google login is not configured. Missing Google client ID.');
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
                this.snackbar.showSuccess('Google signup successful');
                this.router.navigate(['/']);
              },
              error: () => {
                this.snackbar.showError('Google signup failed');
              }
            });
          }
        });

        const buttonContainer = document.getElementById('google-btn-container');
        const formContainer = document.querySelector('form');
        if (buttonContainer) {
          const targetWidth = formContainer ? formContainer.clientWidth : 368;
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            shape: 'rectangular',
            logo_alignment: 'center',
            width: Math.min(targetWidth, 400)
          });
        }
      })
      .catch((err) => {
        console.error('Failed to initialize Google login:', err);
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

  passwordMatchValidator(g: AbstractControl) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'passwordMismatch': true };
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.error.set(null);
      
      this.authService.register({
        name: this.registerForm.value.name || '',
        email: this.registerForm.value.email || undefined
      }).subscribe({
        next: () => {
          this.snackbar.showSuccess('Verification OTP sent. Please login to complete verification.');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.error.set(err.message || 'Registration failed. Please try again.');
          this.isLoading.set(false);
        }
      });
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

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

            <div class="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button type="button"
                  class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  <span class="sr-only">Sign up with Google</span>
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                </button>
              </div>

              <div>
                <button type="button"
                  class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                  <span class="sr-only">Sign up with Facebook</span>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

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
      
      const { email, password, name } = this.registerForm.value;
      
      this.authService.register(email!, password!, name!).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error.set(err.message || 'Registration failed. Please try again.');
          this.isLoading.set(false);
        }
      });
    }
  }
}

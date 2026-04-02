import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="sticky top-0 z-40 w-full border-b border-amber-100/60 bg-white/90 backdrop-blur-lg shadow-[0_8px_30px_rgba(120,90,30,0.08)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 sm:h-20">
          
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="flex items-center gap-2.5 group">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F4E3A1] to-[#C79A2A] shadow-inner">
                <mat-icon class="text-[#D4AF37]">self_improvement</mat-icon>
              </div>
              <span class="font-serif text-xl sm:text-2xl font-bold tracking-wide bg-gradient-to-r from-[#8d6b1f] via-[#C79A2A] to-[#8d6b1f] bg-clip-text text-transparent">Devine Vibes</span>
            </a>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-7">
            <a routerLink="/" routerLinkActive="text-brand-green" [routerLinkActiveOptions]="{exact: true}" class="text-brand-text hover:text-brand-green transition-colors text-sm font-medium">Home</a>
            <a routerLink="/products" routerLinkActive="text-brand-green" class="text-brand-text hover:text-brand-green transition-colors text-sm font-medium">Store</a>
            <a routerLink="/about" routerLinkActive="text-brand-green" class="text-brand-text hover:text-brand-green transition-colors text-sm font-medium">About Us</a>
            <a routerLink="/contact" routerLinkActive="text-brand-green" class="text-brand-text hover:text-brand-green transition-colors text-sm font-medium">Contact Us</a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/user/profile" routerLinkActive="text-brand-green" class="text-brand-text hover:text-brand-green transition-colors text-sm font-medium">My Account</a>
            }
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3 sm:space-x-6">
            <a routerLink="/cart" class="flex items-center text-brand-text hover:text-brand-green transition-colors group">
              <span class="text-brand-green font-semibold mr-1 sm:mr-2 text-xs sm:text-sm">$0.00</span>
              <div class="relative">
                <mat-icon>local_mall</mat-icon>
                <span class="absolute -top-2 -right-2 bg-brand-green text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center group-hover:bg-brand-green-dark transition-colors">0</span>
              </div>
            </a>
            
            @if (auth.isAuthenticated()) {
              <div class="relative group hidden md:block">
                <button class="flex items-center text-brand-text hover:text-brand-green transition-colors">
                  <mat-icon>person</mat-icon>
                </button>
                
                <!-- Dropdown -->
                <div class="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div class="py-1">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm text-brand-dark font-medium truncate">{{ auth.currentUser()?.name || 'User' }}</p>
                    </div>
                    <a routerLink="/order/history" class="block px-4 py-2 text-sm text-brand-text hover:bg-gray-50 hover:text-brand-green">Orders</a>
                    @if (auth.currentUser()?.role === 'ADMIN') {
                      <a routerLink="/admin" class="block px-4 py-2 text-sm text-brand-green hover:bg-gray-50">Admin Dashboard</a>
                    }
                    <button (click)="auth.logout()" class="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
                  </div>
                </div>
              </div>
            } @else {
              <a routerLink="/auth/login" class="hidden md:flex items-center text-brand-text hover:text-brand-green transition-colors">
                <mat-icon>person</mat-icon>
              </a>
            }
            
            <!-- Mobile menu button -->
            <button class="md:hidden text-brand-text hover:text-brand-green p-1 rounded-md border border-amber-100" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
              <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-white border-t border-amber-100 shadow-inner">
          <div class="px-4 pt-3 pb-5 space-y-1.5">
            <a routerLink="/" class="block px-3 py-2.5 text-base font-medium text-brand-text hover:text-brand-green hover:bg-amber-50 rounded-lg">Home</a>
            <a routerLink="/products" class="block px-3 py-2.5 text-base font-medium text-brand-text hover:text-brand-green hover:bg-amber-50 rounded-lg">Store</a>
            <a routerLink="/about" class="block px-3 py-2.5 text-base font-medium text-brand-text hover:text-brand-green hover:bg-amber-50 rounded-lg">About Us</a>
            <a routerLink="/contact" class="block px-3 py-2.5 text-base font-medium text-brand-text hover:text-brand-green hover:bg-amber-50 rounded-lg">Contact Us</a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/user/profile" class="block px-3 py-2.5 text-base font-medium text-brand-text hover:text-brand-green hover:bg-amber-50 rounded-lg">My Account</a>
              <button (click)="auth.logout()" class="block w-full text-left px-3 py-2.5 text-base font-medium text-red-500 hover:bg-red-50 rounded-lg">Logout</button>
            } @else {
              <a routerLink="/auth/login" class="block px-3 py-2.5 text-base font-medium text-brand-green hover:bg-amber-50 rounded-lg">Sign In</a>
            }
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  mobileMenuOpen = signal(false);
}

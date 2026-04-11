import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="sticky top-0 z-40 w-full border-b border-amber-500/10 bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20 sm:h-24">
          
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="flex items-center gap-3 group">
              <img src="/logo.jpeg" alt="Devine Vibes" class="w-12 h-12 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-500" />
              <span class="font-serif text-2xl sm:text-3xl font-semibold tracking-wide bg-gradient-to-r from-brand-gold-light via-brand-gold to-brand-green bg-clip-text text-transparent drop-shadow-sm">Devine Vibes</span>
            </a>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden lg:flex items-center space-x-5 xl:space-x-8">
            <a routerLink="/" routerLinkActive="text-brand-gold font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-brand-text hover:text-brand-gold transition-colors text-sm uppercase tracking-widest font-medium relative group after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand-gold after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">Home</a>
            <a routerLink="/products" routerLinkActive="text-brand-gold font-semibold" class="text-brand-text hover:text-brand-gold transition-colors text-sm uppercase tracking-widest font-medium relative group after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand-gold after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">Store</a>
            <a routerLink="/about" routerLinkActive="text-brand-gold font-semibold" class="text-brand-text hover:text-brand-gold transition-colors text-sm uppercase tracking-widest font-medium relative group after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand-gold after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">About Us</a>
            <a routerLink="/contact" routerLinkActive="text-brand-gold font-semibold" class="text-brand-text hover:text-brand-gold transition-colors text-sm uppercase tracking-widest font-medium relative group after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand-gold after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">Contact Us</a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/user/profile" routerLinkActive="text-brand-gold font-semibold" class="text-brand-text hover:text-brand-gold transition-colors text-sm uppercase tracking-widest font-medium relative group after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-brand-gold after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">My Account</a>
            }
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-4 sm:space-x-8">
            <a routerLink="/wishlist" class="flex items-center text-brand-dark hover:text-brand-gold transition-colors group">
              <div class="relative">
                <mat-icon class="text-brand-green group-hover:text-brand-gold transition-colors duration-300">favorite_border</mat-icon>
                @if (wishlist.count() > 0) {
                  <span class="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold h-[18px] w-[18px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">{{ wishlist.count() }}</span>
                }
              </div>
            </a>

            <a routerLink="/cart" class="flex items-center text-brand-dark hover:text-brand-gold transition-colors group">
              <span class="font-medium mr-2 text-xs sm:text-sm tracking-wide hidden sm:block">{{ cart.count() }} items</span>
              <div class="relative">
                <mat-icon class="text-brand-green group-hover:text-brand-gold transition-colors duration-300">local_mall</mat-icon>
                <span class="absolute -top-1.5 -right-2 bg-brand-gold text-white text-[9px] font-bold h-[18px] w-[18px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">{{ cart.count() }}</span>
              </div>
            </a>
            
            @if (auth.isAuthenticated()) {
              <div class="relative group hidden lg:block">
                <button class="flex items-center text-brand-dark hover:text-brand-gold transition-colors">
                  <mat-icon class="text-[28px]">account_circle</mat-icon>
                </button>
                
                <!-- Dropdown -->
                <div class="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover:translate-y-0 text-brand-dark">
                  <div class="py-2">
                    <div class="px-5 py-3 border-b border-gray-50/50 bg-gray-50/30">
                      <p class="text-[11px] uppercase tracking-widest text-brand-text mb-1">Signed in as</p>
                      <p class="text-sm text-brand-dark font-serif font-semibold truncate">{{ auth.currentUser()?.name || 'User' }}</p>
                    </div>
                    <a routerLink="/order/history" class="block px-5 py-3 text-sm text-brand-text hover:bg-brand-gray hover:text-brand-gold transition-colors flex items-center gap-2"><mat-icon class="text-[18px]">receipt_long</mat-icon> Orders</a>
                    @if (auth.currentUser()?.role === 'ADMIN') {
                      <a routerLink="/admin" class="block px-5 py-3 text-sm text-brand-green font-medium hover:bg-brand-gray transition-colors flex items-center gap-2"><mat-icon class="text-[18px]">admin_panel_settings</mat-icon> Dashboard</a>
                    }
                    <button (click)="auth.logout()" class="block w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"><mat-icon class="text-[18px]">logout</mat-icon> Logout</button>
                  </div>
                </div>
              </div>
            } @else {
              <a routerLink="/auth/login" class="hidden lg:flex items-center text-brand-dark hover:text-brand-gold transition-colors">
                <mat-icon class="text-[28px]">account_circle</mat-icon>
              </a>
            }
            
            <!-- Mobile menu button -->
            <button class="lg:hidden text-brand-dark hover:text-brand-gold transition-colors" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
              <mat-icon class="text-[28px]">{{ mobileMenuOpen() ? 'close' : 'menu_open' }}</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl absolute w-full left-0">
          <div class="px-6 pt-5 pb-8 space-y-2">
            <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-base uppercase tracking-widest font-medium text-brand-text hover:text-brand-gold hover:bg-brand-gray rounded-xl transition-all">Home</a>
            <a routerLink="/products" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-base uppercase tracking-widest font-medium text-brand-text hover:text-brand-gold hover:bg-brand-gray rounded-xl transition-all">Store</a>
            <a routerLink="/about" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-base uppercase tracking-widest font-medium text-brand-text hover:text-brand-gold hover:bg-brand-gray rounded-xl transition-all">About Us</a>
            <a routerLink="/contact" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-base uppercase tracking-widest font-medium text-brand-text hover:text-brand-gold hover:bg-brand-gray rounded-xl transition-all">Contact Us</a>
            @if (auth.isAuthenticated()) {
              <div class="h-px w-full bg-gray-100 my-4"></div>
              <p class="px-4 py-2 text-xs uppercase tracking-widest text-brand-text">{{ auth.currentUser()?.name }}</p>
              @if (auth.currentUser()?.role === 'ADMIN') {
                <a routerLink="/admin" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-base font-medium text-brand-green bg-brand-green/5 hover:text-brand-green-dark hover:bg-brand-green/10 rounded-xl transition-all border border-brand-green/10 shadow-sm mb-2"><mat-icon class="inline align-bottom mr-2 text-[20px]">admin_panel_settings</mat-icon> Admin Dashboard</a>
              }
              <a routerLink="/order/history" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-base font-medium text-brand-dark hover:text-brand-gold hover:bg-brand-gray rounded-xl transition-all"><mat-icon class="inline align-bottom mr-2 text-[20px]">receipt_long</mat-icon> My Orders</a>
              <a routerLink="/user/profile" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-base font-medium text-brand-dark hover:text-brand-gold hover:bg-brand-gray rounded-xl transition-all">My Account</a>
              <button (click)="auth.logout(); mobileMenuOpen.set(false)" class="block w-full text-left px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all">Logout</button>
            } @else {
              <div class="h-px w-full bg-gray-100 my-4"></div>
              <a routerLink="/auth/login" (click)="mobileMenuOpen.set(false)" class="block px-4 py-3 text-center text-sm uppercase tracking-widest font-bold text-white bg-brand-green hover:bg-brand-green-dark rounded-xl transition-all shadow-md">Sign In</a>
            }
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  wishlist = inject(WishlistService);
  mobileMenuOpen = signal(false);
}

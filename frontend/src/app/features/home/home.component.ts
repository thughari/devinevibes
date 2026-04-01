import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-brand-gray py-20 lg:py-32 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Text Content -->
          <div class="text-left">
            <h2 class="text-brand-dark font-medium tracking-wider uppercase text-sm mb-4">Welcome to Devine Vibes</h2>
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-sans font-bold text-brand-dark mb-6 leading-tight">
              Sacred Adornments for <br/> Inner Peace
            </h1>
            <p class="text-lg text-brand-text mb-10 max-w-lg font-light leading-relaxed">
              Discover our curated collection of authentic Rudraksha, Karungali, and spiritual accessories designed to elevate your daily practice.
            </p>
            <div class="flex flex-col sm:flex-row items-start gap-4">
              <a routerLink="/products" class="px-8 py-4 bg-brand-green text-white font-medium uppercase tracking-wider hover:bg-brand-green-dark transition-colors rounded-sm inline-block">
                Shop Now
              </a>
            </div>
          </div>

          <!-- Image -->
          <div class="relative hidden lg:block">
            <div class="absolute inset-0 bg-brand-green/10 rounded-full transform translate-x-10 -translate-y-10 blur-3xl"></div>
            <img 
              src="https://picsum.photos/seed/spiritual/800/800" 
              alt="Spiritual Items" 
              referrerpolicy="no-referrer"
              class="w-full h-auto object-cover rounded-lg shadow-2xl relative z-10"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Value Proposition -->
    <section class="py-16 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-brand-gray flex items-center justify-center text-brand-green">
              <mat-icon>verified</mat-icon>
            </div>
            <div>
              <h3 class="text-lg font-medium text-brand-dark mb-2">100% Authentic</h3>
              <p class="text-brand-text text-sm leading-relaxed">Every bead is lab-tested and certified for authenticity and quality.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-brand-gray flex items-center justify-center text-brand-green">
              <mat-icon>local_shipping</mat-icon>
            </div>
            <div>
              <h3 class="text-lg font-medium text-brand-dark mb-2">Secure Shipping</h3>
              <p class="text-brand-text text-sm leading-relaxed">Carefully packaged and shipped worldwide with tracking.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-brand-gray flex items-center justify-center text-brand-green">
              <mat-icon>spa</mat-icon>
            </div>
            <div>
              <h3 class="text-lg font-medium text-brand-dark mb-2">Energized</h3>
              <p class="text-brand-text text-sm leading-relaxed">All items are properly energized before being dispatched to you.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-sans font-bold text-brand-dark mb-4">Sacred Collections</h2>
          <div class="w-16 h-1 bg-brand-green mx-auto"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Category 1 -->
          <a routerLink="/products" [queryParams]="{category: 'rudraksha'}" class="group relative bg-brand-gray rounded-lg overflow-hidden block text-center p-8">
            <div class="h-64 mb-6 overflow-hidden rounded-md">
              <img src="https://picsum.photos/seed/rudraksha/400/400" alt="Rudraksha" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            </div>
            <h3 class="text-xl font-medium text-brand-dark mb-2">Rudraksha Malas</h3>
            <p class="text-sm text-brand-text mb-4">Authentic Himalayan seeds for meditation.</p>
          </a>

          <!-- Category 2 -->
          <a routerLink="/products" [queryParams]="{category: 'karungali'}" class="group relative bg-brand-gray rounded-lg overflow-hidden block text-center p-8">
            <div class="h-64 mb-6 overflow-hidden rounded-md">
              <img src="https://picsum.photos/seed/wood/400/400" alt="Karungali" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            </div>
            <h3 class="text-xl font-medium text-brand-dark mb-2">Karungali</h3>
            <p class="text-sm text-brand-text mb-4">Sacred ebony wood for protection.</p>
          </a>

          <!-- Category 3 -->
          <a routerLink="/products" [queryParams]="{category: 'bracelets'}" class="group relative bg-brand-gray rounded-lg overflow-hidden block text-center p-8">
            <div class="h-64 mb-6 overflow-hidden rounded-md">
              <img src="https://picsum.photos/seed/bracelet/400/400" alt="Bracelets" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            </div>
            <h3 class="text-xl font-medium text-brand-dark mb-2">Spiritual Bracelets</h3>
            <p class="text-sm text-brand-text mb-4">Daily wear for continuous energy.</p>
          </a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {}

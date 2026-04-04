import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-[#FAF8F5] via-[#FCFCFA] to-white py-16 sm:py-24 lg:py-32 overflow-hidden">
      <!-- Premium grain/glow overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_top_right,_rgba(199,154,42,0.08)_0%,_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(22,78,50,0.05)_0%,_transparent_40%)]"></div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Text Content -->
          <div class="lg:col-span-6 text-left">
            <h2 class="text-brand-gold font-sans font-medium tracking-[0.3em] uppercase text-[10px] sm:text-xs mb-6">Welcome to Devine Vibes</h2>
            <h1 class="text-5xl sm:text-6xl lg:text-[5rem] font-serif font-bold text-brand-dark mb-8 leading-[1.1] tracking-tight">
              Sacred Adornments <br/><span class="text-brand-green italic font-light">for Inner Peace</span>
            </h1>
            <p class="text-lg text-brand-text mb-10 max-w-lg font-sans font-light leading-relaxed">
              Discover our curated collection of authentic Rudraksha, Karungali, and spiritual accessories, meticulously designed to elevate your daily practice.
            </p>
            <div class="flex flex-col sm:flex-row items-start gap-4">
              <a routerLink="/products" class="px-8 py-4 bg-brand-green text-white font-sans font-medium text-sm tracking-widest uppercase hover:bg-brand-green-dark shadow-[0_4px_20px_rgba(31,122,85,0.3)] hover:shadow-[0_8px_30px_rgba(31,122,85,0.4)] hover:-translate-y-0.5 transition-all duration-300 rounded-sm inline-block">
                Explore Collection
              </a>
            </div>
          </div>

          <!-- Image -->
          <div class="lg:col-span-6 relative mt-16 lg:mt-0">
            <div class="absolute inset-0 bg-brand-gold/10 rounded-full transform translate-x-12 -translate-y-12 blur-3xl w-full h-full"></div>
            <div class="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
              <img
                src="karungali.webp"
                alt="Spiritual Items" 
                referrerpolicy="no-referrer"
                class="w-full h-auto object-cover scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Value Proposition -->
    <section class="py-20 relative bg-white border-b border-gray-100/50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div class="flex flex-col items-center gap-5 p-8 rounded-2xl hover:bg-brand-gray/50 transition-colors duration-500">
            <div class="flex-shrink-0 w-16 h-16 rounded-full bg-brand-green/5 flex items-center justify-center text-brand-green ring-1 ring-brand-green/20">
              <mat-icon class="text-[32px] w-[32px] h-[32px]">verified</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-serif font-semibold text-brand-dark mb-3">100% Authentic</h3>
              <p class="text-brand-text text-base font-light leading-relaxed">Every bead is lab-tested and certified for supreme authenticity and quality.</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-5 p-8 rounded-2xl hover:bg-brand-gray/50 transition-colors duration-500">
            <div class="flex-shrink-0 w-16 h-16 rounded-full bg-brand-green/5 flex items-center justify-center text-brand-green ring-1 ring-brand-green/20">
              <mat-icon class="text-[32px] w-[32px] h-[32px]">local_shipping</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-serif font-semibold text-brand-dark mb-3">Secure Shipping</h3>
              <p class="text-brand-text text-base font-light leading-relaxed">Carefully packaged in premium casing and shipped worldwide with precise tracking.</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-5 p-8 rounded-2xl hover:bg-brand-gray/50 transition-colors duration-500">
            <div class="flex-shrink-0 w-16 h-16 rounded-full bg-brand-green/5 flex items-center justify-center text-brand-green ring-1 ring-brand-green/20">
              <mat-icon class="text-[32px] w-[32px] h-[32px]">spa</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-serif font-semibold text-brand-dark mb-3">Sacred Energy</h3>
              <p class="text-brand-text text-base font-light leading-relaxed">All items are properly energized through ancient rituals before being dispatched.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-24 bg-[#FAFAFA]">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h4 class="text-brand-gold font-sans font-medium tracking-[0.2em] uppercase text-xs mb-3">Our Core Collections</h4>
          <h2 class="text-4xl md:text-5xl font-serif font-bold text-brand-dark tracking-tight">Discover the Sacred</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <!-- Category 1 -->
          <a routerLink="/products" [queryParams]="{category: 'rudraksha'}" class="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl ring-1 ring-black/5 transition-all duration-500">
            <div class="aspect-[4/5] overflow-hidden bg-brand-gray relative">
              <div class="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
              <img src="rudraksha-maala.jpg" alt="Rudraksha" referrerpolicy="no-referrer" class="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-in-out"/>
              <div class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                <h3 class="text-2xl font-serif text-white mb-2 tracking-wide">Rudraksha Malas</h3>
                <p class="text-sm text-gray-200 font-light flex items-center gap-2">Explore <mat-icon class="text-[16px]">arrow_forward</mat-icon></p>
              </div>
            </div>
          </a>

          <!-- Category 2 -->
          <a routerLink="/products" [queryParams]="{category: 'karungali'}" class="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl ring-1 ring-black/5 transition-all duration-500">
            <div class="aspect-[4/5] overflow-hidden bg-brand-gray relative">
              <div class="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
              <img src="rudraksha.webp" alt="Karungali" referrerpolicy="no-referrer" class="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-in-out"/>
              <div class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                <h3 class="text-2xl font-serif text-white mb-2 tracking-wide">Karungali Wood</h3>
                <p class="text-sm text-gray-200 font-light flex items-center gap-2">Explore <mat-icon class="text-[16px]">arrow_forward</mat-icon></p>
              </div>
            </div>
          </a>

          <!-- Category 3 -->
          <a routerLink="/products" [queryParams]="{category: 'bracelets'}" class="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl ring-1 ring-black/5 transition-all duration-500">
            <div class="aspect-[4/5] overflow-hidden bg-brand-gray relative">
              <div class="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
              <img src="bracelet.webp" alt="Bracelets" referrerpolicy="no-referrer" class="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 ease-in-out"/>
              <div class="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                <h3 class="text-2xl font-serif text-white mb-2 tracking-wide">Sacred Bracelets</h3>
                <p class="text-sm text-gray-200 font-light flex items-center gap-2">Explore <mat-icon class="text-[16px]">arrow_forward</mat-icon></p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {}

import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-[#FFD700] via-[#FFF2A8] to-[#FFD700] py-16 sm:py-24 lg:py-32 overflow-hidden animate-fadeIn animate-gradient-shift">
      <!-- Luxury overlay effects -->
      <div class="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_top_right,_rgba(199,154,42,0.08)_0%,_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(22,78,50,0.05)_0%,_transparent_40%)]"></div>
      
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Text Content -->
          <div class="lg:col-span-6 text-left animate-slideInLeft">
            <h2 class="text-brand-dark font-sans font-medium tracking-[0.3em] uppercase text-[10px] sm:text-xs mb-6 opacity-80" style="animation-delay: 0.1s;">Welcome to Devine Vibes</h2>
            <h1 class="text-4xl sm:text-6xl lg:text-[5rem] font-serif font-bold text-brand-dark mb-8 leading-[1.1] tracking-tight" style="animation-delay: 0.2s;">
              Sacred Adornments <br/><span class="text-brand-green italic font-light drop-shadow-sm">for Inner Peace</span>
            </h1>
            <p class="text-lg text-brand-text mb-10 max-w-lg font-sans font-light leading-relaxed drop-shadow-sm">
              Discover our curated collection of authentic Rudraksha, Karungali, and spiritual accessories, meticulously designed to elevate your daily practice.
            </p>
            <div class="flex flex-col sm:flex-row items-start gap-4 animate-scaleIn" style="animation-delay: 0.4s;">
              <a routerLink="/products" class="px-8 py-4 bg-brand-green text-white font-sans font-medium text-sm tracking-widest uppercase hover:bg-brand-green-dark shadow-[0_4px_20px_rgba(31,122,85,0.3)] hover:shadow-[0_8px_30px_rgba(31,122,85,0.4)] hover:-translate-y-0.5 transition-all duration-300 rounded-sm inline-block animate-scale-pulse hover:animate-heart-beat">
                Explore Store
              </a>
              <a [routerLink]="['/']" fragment="core-collections" class="px-8 py-4 bg-transparent border-2 border-brand-green text-brand-green font-sans font-medium text-sm tracking-widest uppercase hover:bg-brand-green hover:text-white transition-all duration-300 rounded-sm inline-block">
                View Collections
              </a>
            </div>
          </div>

          <!-- Image -->
          <div class="lg:col-span-6 relative mt-16 lg:mt-0 animate-slideInRight">
            <div class="absolute inset-0 bg-brand-gold/20 rounded-full transform translate-x-12 -translate-y-12 blur-3xl w-full h-full animate-glow"></div>
            <div class="relative rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.15)] ring-1 ring-black/5 animate-bounceIn" style="animation-delay: 0.3s;">
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
    <section class="py-20 relative bg-[#FFD700]/10 border-b border-brand-gold/10">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div class="flex flex-col items-center gap-5 p-8 rounded-2xl hover:bg-white/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group">
            <div class="flex-shrink-0 w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green ring-2 ring-brand-green/20 group-hover:scale-110 transition-transform">
              <mat-icon class="text-[32px] w-[32px] h-[32px]">verified</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-serif font-semibold text-brand-dark mb-3">100% Authentic</h3>
              <p class="text-brand-text text-base font-light leading-relaxed">Every bead is lab-tested and certified for supreme authenticity and quality.</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-5 p-8 rounded-2xl hover:bg-white/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group">
            <div class="flex-shrink-0 w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green ring-2 ring-brand-green/20 group-hover:scale-110 transition-transform">
              <mat-icon class="text-[32px] w-[32px] h-[32px]">local_shipping</mat-icon>
            </div>
            <div>
              <h3 class="text-xl font-serif font-semibold text-brand-dark mb-3">Secure Shipping</h3>
              <p class="text-brand-text text-base font-light leading-relaxed">Carefully packaged in premium casing and shipped worldwide with precise tracking.</p>
            </div>
          </div>
          <div class="flex flex-col items-center gap-5 p-8 rounded-2xl hover:bg-white/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group">
            <div class="flex-shrink-0 w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green ring-2 ring-brand-green/20 group-hover:scale-110 transition-transform">
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

    <!-- Rudraksha Featured Section -->
    <section class="relative bg-gradient-to-r from-[#FFD700] via-[#FFF2A8] to-[#FFD700] py-24 lg:py-32 overflow-hidden animate-fadeIn">
      <div class="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_bottom_right,_rgba(199,154,42,0.15)_0%,_transparent_50%),radial-gradient(circle_at_top_left,_rgba(224,188,96,0.1)_0%,_transparent_50%)]"></div>
      
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <!-- Left Image -->
          <div class="relative order-2 lg:order-1">
            <div class="absolute inset-0 bg-gradient-to-b from-brand-gold/30 to-transparent rounded-3xl blur-2xl w-full h-full animate-expand-glow"></div>
            <div class="relative rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.3)] ring-4 ring-brand-gold/30 hover:ring-brand-gold/60 transition-all duration-700 hover:scale-[1.02] cursor-pointer group">
              <img
                src="rudraksha.webp"
                alt="Sacred Rudraksha Mala" 
                referrerpolicy="no-referrer"
                class="w-full h-auto object-cover animate-float-rotate group-hover:animate-spin-float transition-all duration-1000"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
            </div>
          </div>
          
          <!-- Right Content -->
          <div class="text-center lg:text-left order-1 lg:order-2">
            <h3 class="text-brand-dark font-sans font-bold tracking-[0.4em] uppercase text-4xl sm:text-6xl lg:text-7xl mb-6 leading-tight drop-shadow-md">
              Rudraksha
            </h3>
            
            <div class="inline-flex items-center gap-3 bg-white/40 border border-brand-gold/30 rounded-2xl px-6 py-4 mb-10 backdrop-blur-md hover:border-brand-gold/50 transition-all duration-500 transform hover:scale-105 shadow-sm mx-auto lg:mx-0">
              <p class="text-brand-green font-serif text-lg sm:text-2xl font-semibold tracking-wide flex items-center gap-3">
                <mat-icon class="text-brand-gold animate-pulse">auto_awesome</mat-icon> Divine Spiritual Power
              </p>
            </div>
            
            <div class="space-y-6 mb-12">
              <p class="text-brand-dark font-serif text-xl sm:text-2xl font-light tracking-wide leading-relaxed">
                Authentic Lab-Certified <span class="font-bold border-b-2 border-brand-gold">Rudraksha Beads</span>
              </p>
              <p class="text-brand-dark/80 font-serif text-lg sm:text-xl font-medium tracking-wide flex items-center justify-center lg:justify-start gap-3">
                <mat-icon class="text-brand-green text-[24px] sm:text-[28px]">verified_user</mat-icon>
                Energized & Blessed for Clarity
              </p>
            </div>
            
            <a routerLink="/products" [queryParams]="{category: 'rudraksha'}" class="inline-block px-10 py-5 bg-brand-dark text-white font-sans font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-brand-green border border-brand-gold/20 shadow-[0_15px_35px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_45px_rgba(31,122,85,0.4)] hover:scale-110 transition-all duration-500 rounded-full animate-scale-pulse hover:animate-heart-beat">
              Explore Collection
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section id="core-collections" class="py-24 relative bg-gradient-to-b from-[#FFFBEB] to-[#FFD700]/10 overflow-hidden scroll-mt-20">
      <!-- Luxury overlay effects -->
      <div class="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(199,154,42,0.1)_0%,_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(22,78,50,0.05)_0%,_transparent_50%)]"></div>
      
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="text-center mb-16">
          <h4 class="text-brand-gold font-sans font-medium tracking-[0.2em] uppercase text-xs mb-3">Our Core Collections</h4>
          <h2 class="text-4xl md:text-5xl font-serif font-bold text-brand-dark tracking-tight">Discover the Sacred</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          @for(cat of categories(); track cat.id) {
            <a routerLink="/products" [queryParams]="{category: cat.slug}" class="group block bg-[#FFD700]/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl ring-1 ring-black/5 transition-all duration-700 hover:-translate-y-2">
              <div class="aspect-[4/5] overflow-hidden bg-brand-gray relative">
                <div class="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors z-10 duration-700"></div>
                @if(cat.imageUrl) {
                  <img [src]="cat.imageUrl" [alt]="cat.name" referrerpolicy="no-referrer" class="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 ease-in-out"/>
                } @else {
                  <div class="w-full h-full bg-gradient-to-br from-brand-gold/30 to-brand-green/30"></div>
                }
                <div class="absolute bottom-0 left-0 w-full p-6 sm:p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 transition-all duration-500">
                  <h3 class="text-2xl sm:text-3xl font-serif text-white mb-2 sm:mb-3 tracking-wide drop-shadow-lg">{{ cat.name }}</h3>
                  <div class="overflow-hidden h-6">
                    <p class="text-xs sm:text-sm text-brand-gold font-medium flex items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      Explore Collection <mat-icon class="text-[16px] sm:text-[18px]">arrow_right_alt</mat-icon>
                    </p>
                  </div>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

  `
})
export class HomeComponent implements OnInit {
  private categoryService = inject(CategoryService);
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats)
    });
  }
}

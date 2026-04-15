import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <header class="relative bg-gradient-to-r from-[#FFD700] via-[#FFF2A8] to-[#FFD700] py-20 overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(199,154,42,0.15)_0%,_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(22,78,50,0.05)_0%,_transparent_50%)]"></div>
      <div class="max-w-7xl mx-auto px-6 relative z-10 text-center animate-fadeIn">
        <h1 class="text-5xl sm:text-6xl font-serif font-bold text-brand-dark mb-4 tracking-tight drop-shadow-sm">Contact Us</h1>
        <p class="text-brand-dark/80 font-sans font-medium uppercase tracking-[0.4em] text-[10px] sm:text-xs">We're here to guide your journey</p>
      </div>
    </header>

    <section class="max-w-5xl mx-auto px-6 py-20">
      <div class="text-center mb-16 max-w-2xl mx-auto">
        <p class="text-brand-text text-lg font-light leading-relaxed">
          Need help choosing a product, tracking an order, or resolving an issue? Reach out to our dedicated support team.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div class="bg-white border border-brand-gold/10 rounded-3xl p-10 shadow-xl hover:shadow-brand-gold/5 transition-all duration-500 group">
          <div class="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 group-hover:scale-110 transition-transform">
            <mat-icon>mail</mat-icon>
          </div>
          <h2 class="font-serif text-2xl font-bold text-brand-dark mb-6">Support Details</h2>
          <div class="space-y-4">
            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-widest text-brand-text/50 font-bold mb-1">Email</span>
              <span class="text-lg font-medium text-brand-dark">support@devinevibes.in</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-widest text-brand-text/50 font-bold mb-1">Response Time</span>
              <span class="text-lg font-medium text-brand-dark">Within 24 business hours</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-widest text-brand-text/50 font-bold mb-1">Hours</span>
              <span class="text-lg font-medium text-brand-dark">Mon–Sat, 10:00 AM – 7:00 PM IST</span>
            </div>
            <a
              href="https://wa.me/919949944726?text=Hi%20Devine%20Vibes%2C%20I%20need%20help%20with%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex mt-3 items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 transition"
            >
              <mat-icon class="!text-base">chat</mat-icon>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div class="bg-brand-dark rounded-3xl p-10 shadow-2xl overflow-hidden relative group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div class="relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-brand-gold/20 flex items-center justify-center text-brand-gold mb-6 group-hover:scale-110 transition-transform">
              <mat-icon>comment</mat-icon>
            </div>
            <h2 class="font-serif text-2xl font-bold text-white mb-6">Message Guidelines</h2>
            <p class="text-gray-400 text-sm mb-6 leading-relaxed">To help us assist you better, please include:</p>
            <ul class="space-y-4">
              <li class="flex items-center gap-3 text-white/90">
                <mat-icon class="text-brand-gold text-[18px] w-[18px] h-[18px]">check_circle</mat-icon>
                <span>Order ID (if applicable)</span>
              </li>
              <li class="flex items-center gap-3 text-white/90">
                <mat-icon class="text-brand-gold text-[18px] w-[18px] h-[18px]">check_circle</mat-icon>
                <span>Registered email or phone number</span>
              </li>
              <li class="flex items-center gap-3 text-white/90">
                <mat-icon class="text-brand-gold text-[18px] w-[18px] h-[18px]">check_circle</mat-icon>
                <span>A clear description of your inquiry</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-white border border-brand-gold/10 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="font-serif text-2xl font-bold text-brand-dark">Find Us on Google Maps</h2>
          
          <a
            href="https://maps.app.goo.gl/9hycSDq9hmAdn2yD9"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:text-brand-green-dark"
          >
            Open in Google Maps
            <mat-icon class="!text-base">open_in_new</mat-icon>
          </a>
        </div>
        <iframe
          title="Devine Vibes location on Google Maps"
          class="w-full h-[360px] rounded-2xl border border-brand-gold/20"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d173795.96090847132!2d80.25874339322586!3d15.730788467711951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a44190bfbc73d%3A0xa88209a2b42c2b62!2sKasi%20Visweswara%20Fast%20Foods!5e0!3m2!1sen!2sin!4v1776240664790!5m2!1sen!2sind">
        </iframe>
      </div>
    </section>
  `
})
export class ContactComponent {}

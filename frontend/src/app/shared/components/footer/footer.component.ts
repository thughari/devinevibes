import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="relative bg-gradient-to-b from-[#FFFBEB] via-[#FFFBEB] to-[#FFD700]/30 pt-20 pb-10 mt-auto overflow-hidden border-t border-brand-gold/10">
      <!-- Luxury overlay effects -->
      <div class="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(199,154,42,0.1)_0%,_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(22,78,50,0.05)_0%,_transparent_50%)]"></div>
      
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 items-start">
          
          <!-- Brand -->
          <div class="col-span-1 md:col-span-1 text-left">
            <a routerLink="/" class="flex items-center gap-3 mb-6 group">
              <div class="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F4E3A1] to-[#C79A2A] shadow-lg group-hover:scale-110 transition-transform duration-500">
                <mat-icon class="text-white">self_improvement</mat-icon>
              </div>
              <span class="font-serif text-3xl font-bold tracking-tight text-brand-dark group-hover:text-brand-gold transition-colors duration-500">Devine Vibes</span>
            </a>
            <p class="text-base text-brand-text leading-relaxed font-light">
              Authentic spiritual items, rudraksha malas, and sacred accessories meticulously curated for your spiritual journey.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="text-left">
            <h3 class="text-sm font-sans font-bold text-brand-dark uppercase tracking-widest mb-6">Quick Links</h3>
            <ul class="space-y-4">
              <li><a routerLink="/" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">Home</a></li>
              <li><a routerLink="/products" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">Store</a></li>
              <li><a routerLink="/about" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">About Us</a></li>
              <li><a routerLink="/contact" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">Contact Us</a></li>
            </ul>
          </div>

          <!-- Important Links -->
          <div class="text-left">
            <h3 class="text-sm font-sans font-bold text-brand-dark uppercase tracking-widest mb-6">Important Links</h3>
            <ul class="space-y-4">
              <li><a routerLink="/shipping" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">Shipping Policy</a></li>
              <li><a routerLink="/returns" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">Returns & Refunds</a></li>
              <li><a routerLink="/faq" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">FAQ</a></li>
              <li><a routerLink="/user/profile" class="text-sm text-brand-text hover:text-brand-gold hover:translate-x-1 transition-all inline-block">My Account</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="text-left">
            <h3 class="text-sm font-sans font-bold text-brand-dark uppercase tracking-widest mb-6">Need help?</h3>
            <p class="text-sm text-brand-text leading-relaxed mb-8 font-light">
              Unsure which sacred item is right for you? Our spiritual consultants are here to guide you.
            </p>
            <a routerLink="/contact" class="px-8 py-4 bg-brand-green text-white font-sans font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-brand-green-dark shadow-xl hover:shadow-[0_15px_30px_rgba(31,122,85,0.3)] transition-all rounded-full inline-block group">
              <span class="flex items-center gap-2">Connect With Us <mat-icon class="text-[14px] w-[14px] h-[14px] group-hover:translate-x-1 transition-transform">send</mat-icon></span>
            </a>
            
            <div class="flex gap-4 mt-10">
              <a href="#" class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all transform hover:-translate-y-1">
                <span class="sr-only">Facebook</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-dark hover:bg-brand-gold hover:text-white transition-all transform hover:-translate-y-1">
                <span class="sr-only">Instagram</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div class="mt-20 pt-8 border-t border-brand-gold/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p class="text-sm text-brand-text/60 font-medium">
            &copy; {{ newDate() }} <span class="text-brand-gold">Devine Vibes</span>. Elevated Spirituality.
          </p>
          <div class="flex gap-8">
            <a href="#" class="text-xs uppercase tracking-widest text-brand-text/60 hover:text-brand-gold transition-colors">Privacy Policy</a>
            <a href="#" class="text-xs uppercase tracking-widest text-brand-text/60 hover:text-brand-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>

  `
})
export class FooterComponent {
  newDate() {
    return new Date().getFullYear();
  }
}

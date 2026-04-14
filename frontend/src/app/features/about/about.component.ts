import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <header class="relative bg-gradient-to-r from-[#FFD700] via-[#FFF2A8] to-[#FFD700] py-20 overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top_right,_rgba(199,154,42,0.15)_0%,_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(22,78,50,0.05)_0%,_transparent_50%)]"></div>
      <div class="max-w-7xl mx-auto px-6 relative z-10 text-center animate-fadeIn">
        <h1 class="text-5xl sm:text-6xl font-serif font-bold text-brand-dark mb-4 tracking-tight drop-shadow-sm">About Devine Vibes</h1>
        <p class="text-brand-dark/80 font-sans font-medium uppercase tracking-[0.4em] text-[10px] sm:text-xs">Authentic. Energized. Sacred.</p>
      </div>
    </header>

    <section class="max-w-5xl mx-auto px-6 py-20 sm:py-24">
      <div class="space-y-10">
        <div class="border-l-4 border-brand-green pl-6 py-2">
          <p class="text-2xl font-serif text-brand-dark italic leading-relaxed">
            "Devine Vibes was created with one simple intention: to make authentic spiritual essentials accessible to every seeker."
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <p class="text-brand-text text-lg leading-relaxed font-light">
            From energised malas to sacred accessories, every product is selected for quality, intention, and traditional value. 
            We work directly with trusted artisans and verified sources to ensure purity, transparency, and meaningful craftsmanship.
          </p>
          <p class="text-brand-text text-lg leading-relaxed font-light">
            Whether you are beginning your spiritual journey or deepening an existing practice, our collection is designed to support
            daily sadhana with beauty and authenticity. Our promise is simple: honest guidance, dependable service, and products you can trust.
          </p>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {}

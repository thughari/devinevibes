import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <section class="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      <h1 class="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">About Devine Vibes</h1>
      <p class="text-brand-text leading-7 mb-4">
        Devine Vibes was created with one simple intention: to make authentic spiritual essentials accessible to every seeker.
        From energised malas to sacred accessories, every product is selected for quality, intention, and traditional value.
      </p>
      <p class="text-brand-text leading-7 mb-4">
        We work directly with trusted artisans and verified sources to ensure purity, transparency, and meaningful craftsmanship.
        Whether you are beginning your spiritual journey or deepening an existing practice, our collection is designed to support
        daily sadhana with beauty and authenticity.
      </p>
      <p class="text-brand-text leading-7">
        Our promise is simple: honest guidance, dependable service, and products you can trust.
      </p>
    </section>
  `
})
export class AboutComponent {}

import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <section class="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <h1 class="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">About Devine Vibes</h1>
      <p class="text-brand-text leading-7">We curate authentic spiritual products for daily practice, gifting, and mindful living.</p>
    </section>
  `
})
export class AboutComponent {}

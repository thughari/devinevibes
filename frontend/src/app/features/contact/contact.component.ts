import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <section class="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <h1 class="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">Contact Us</h1>
      <p class="text-brand-text mb-2">Email: verification@devinevibes.in</p>
      <p class="text-brand-text">We typically reply within 24 hours.</p>
    </section>
  `
})
export class ContactComponent {}

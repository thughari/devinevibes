import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <section class="max-w-5xl mx-auto px-4 py-10 sm:py-14">
      <h1 class="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">Contact Us</h1>
      <p class="text-brand-text mb-6">
        Need help choosing a product, tracking an order, or resolving an issue? We are here to help.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 class="font-semibold text-brand-dark mb-3">Support Details</h2>
          <p class="text-sm text-brand-text mb-1"><strong>Email:</strong> support@devinevibes.in</p>
          <p class="text-sm text-brand-text mb-1"><strong>Response Time:</strong> 24 business hours</p>
          <p class="text-sm text-brand-text"><strong>Hours:</strong> Mon–Sat, 10:00 AM – 7:00 PM IST</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 class="font-semibold text-brand-dark mb-3">What to include in your message</h2>
          <ul class="list-disc list-inside text-sm text-brand-text space-y-1">
            <li>Order ID (if applicable)</li>
            <li>Your registered email/phone</li>
            <li>A short description of your issue</li>
          </ul>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {}

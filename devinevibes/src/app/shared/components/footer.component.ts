import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <img src="assets/devine-vibes-logo.jpeg" alt="Devine Vibes" />
      <p>© {{ year }} Devine Vibes • Spiritual Luxury</p>
    </footer>
  `,
  styles: [
    `.footer{display:flex;align-items:center;justify-content:center;gap:.75rem;border-top:1px solid #222;padding:1rem;color:var(--muted)} img{height:28px;width:28px;border-radius:50%;object-fit:cover}`
  ]
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}

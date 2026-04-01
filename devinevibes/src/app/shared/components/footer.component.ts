import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer-wrap">
      <section class="footer-grid">
        <div>
          <h3>Get In Touch With Us For The Best Rudraksha Collection</h3>
          <p>
            Premium malas and bracelets crafted with devotion. Experience authentic spiritual
            wellness with every bead.
          </p>
        </div>

        <div class="brand-col">
          <div class="flower">✦</div>
          <h4>Devine Vibes</h4>
          <small>Spiritual Luxury</small>
        </div>

        <div>
          <h4>Quick Links</h4>
          <a href="#">Home</a>
          <a href="#">Collection</a>
          <a href="#">Our Story</a>
          <a href="#">Contact</a>
        </div>

        <div>
          <h4>Important Links</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Shipping Details</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">FAQ</a>
        </div>
      </section>

      <div class="copyright">
        <p>Copyright © {{ year }} Devine Vibes</p>
        <p>Powered by Devine Vibes</p>
      </div>
    </footer>
  `,
  styles: [
    `.footer-wrap{margin-top:4rem;background:#e9e9e9;color:#20263a;padding:4rem 1.5rem 2rem}`,
    `.footer-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1.2fr 1fr 1fr;gap:2rem}`,
    `.footer-grid h3{margin-top:0;font-size:2rem}.footer-grid p{line-height:1.7;color:#4a4f5f}`,
    `.footer-grid a{display:block;color:#2f3447;margin:.6rem 0}.footer-grid h4{font-size:1.5rem;margin:0 0 1rem}`,
    `.brand-col{text-align:center}.flower{margin:0 auto .8rem;background:#d4af37;color:#131313;height:64px;width:64px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:30px}`,
    `.copyright{max-width:1200px;margin:3rem auto 0;display:flex;justify-content:space-between;color:#4a4f5f;border-top:1px solid #d4d4d4;padding-top:1rem}`
  ]
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}

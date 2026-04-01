import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from './product.service';
import { ProductResponse } from '../../shared/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { CartService } from '../cart/cart.service';
import { LoaderComponent } from '../../shared/components/loader.component';

@Component({
  selector: 'app-product-list-page',
  imports: [ProductCardComponent, LoaderComponent, RouterLink],
  template: `
    <section class="hero card-lite">
      <div>
        <p class="eyebrow">Sacred Rudraksha Collection</p>
        <h1>Awaken Inner Energy With Devine Vibes</h1>
        <p class="sub">Authentic malas, karungali beads, and bracelets for mindful living.</p>
        <button class="btn primary" (click)="scrollToCollection()">Shop Now</button>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="bead bead-1"></div>
        <div class="bead bead-2"></div>
        <div class="bead bead-3"></div>
      </div>
    </section>

    <section class="usps card-lite">
      <article><h3>Premium Beads</h3><p>Handpicked spiritual accessories</p></article>
      <article><h3>Free Shipping</h3><p>Across India on eligible orders</p></article>
      <article><h3>Assured Quality</h3><p>Trusted material authenticity</p></article>
    </section>

    <section class="category-grid">
      <article class="category-card"><h3>Rudraksha Malas</h3><p>Meditation and daily wear selections.</p></article>
      <article class="category-card"><h3>Karungali Mala</h3><p>Traditional spiritual protection beads.</p></article>
      <article class="category-card"><h3>Bracelets</h3><p>Minimal premium styles for every day.</p></article>
    </section>

    <section id="collection" class="collection-intro">
      <h2>Featured Spiritual Picks</h2>
      <p>Clean and premium storefront presentation inspired by your reference direction.</p>
    </section>

    @if (loading()) {
      <app-loader label="Loading sacred products..." />
    } @else {
      <div class="grid">
        @for (item of products(); track item.id) {
          <app-product-card [product]="item" (add)="addToCart($event)" />
        }
      </div>
    }

    <section class="testimonials card-lite">
      <h2>Testimonials</h2>
      <div class="test-grid">
        <article><p>“Strong quality beads and elegant finish. Perfect for my daily sadhana.”</p><strong>— Aarav</strong></article>
        <article><p>“Beautiful packaging and spiritual authenticity. Highly recommended.”</p><strong>— Meera</strong></article>
      </div>
    </section>

    <section class="cta card-lite">
      <h2>Interested? Explore The Full Devine Vibes Collection</h2>
      <p>Ground your routine with handcrafted spiritual pieces that blend tradition and premium style.</p>
      <a routerLink="/" class="btn primary">Go To Shop</a>
    </section>
  `,
  styles: [
    `.hero{display:grid;grid-template-columns:1.1fr 1fr;align-items:center;gap:2rem;padding:3rem;border-radius:0 0 42px 42px}`,
    `.eyebrow{font-weight:600;color:#b28918}.hero h1{font-size:3.4rem;line-height:1.1;margin:.5rem 0 1rem;color:#1e2333}.sub{color:#525767;max-width:520px}`,
    `.hero-art{min-height:360px;border-radius:28px;background:linear-gradient(145deg,#f7edd2,#e0c58e);position:relative;overflow:hidden}`,
    `.bead{position:absolute;border-radius:50%;background:radial-gradient(circle at 30% 30%,#6f4a24,#2f1d0f);box-shadow:0 12px 30px rgba(0,0,0,.25)}.bead-1{width:170px;height:170px;top:40px;left:80px}.bead-2{width:130px;height:130px;bottom:60px;right:95px}.bead-3{width:220px;height:220px;bottom:-30px;left:190px}`,
    `.usps{margin-top:1rem;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;padding:2rem}.usps h3{margin:0 0 .4rem;color:#1e2333}.usps p{margin:0;color:#61677a}`,
    `.category-grid{margin:2rem 0;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.category-card{background:#ece8dd;border-radius:18px;padding:2rem;min-height:180px}.category-card h3{margin:0 0 .5rem;color:#1e2333}.category-card p{color:#62687a}`,
    `.collection-intro{text-align:center;padding:3rem 1rem 2rem}.collection-intro h2{font-size:3rem;color:#1f2330}.collection-intro p{color:#5d6476}`,
    `.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.2rem}`,
    `.testimonials{margin-top:3rem;padding:3rem}.testimonials h2{text-align:center;font-size:2.7rem;color:#1f2330}.test-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.test-grid article{background:#fff;border-radius:14px;padding:1.25rem;color:#353c4f}`,
    `.cta{margin-top:3rem;text-align:center;padding:4rem 1rem;background:linear-gradient(180deg,#f0ebe2,#dfcfad)}.cta h2{font-size:2.8rem;max-width:820px;margin:0 auto 1rem;color:#1e2333}.cta p{max-width:760px;margin:0 auto 2rem;color:#454c60}`,
    `@media (max-width:1000px){.hero{grid-template-columns:1fr}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.usps,.category-grid,.test-grid{grid-template-columns:1fr}} @media (max-width:640px){.grid{grid-template-columns:1fr}.hero h1,.collection-intro h2,.cta h2,.testimonials h2{font-size:2rem}}`
  ]
})
export class ProductListPageComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  protected readonly products = signal<ProductResponse[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products.set(data);
      this.loading.set(false);
    });
  }

  addToCart(productId: string): void {
    this.cartService.addToCart({ productId, quantity: 1 }).subscribe();
  }

  scrollToCollection(): void {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  }
}

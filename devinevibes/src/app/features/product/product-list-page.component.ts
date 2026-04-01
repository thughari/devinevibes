import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductService } from './product.service';
import { ProductResponse } from '../../shared/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { CartService } from '../cart/cart.service';
import { LoaderComponent } from '../../shared/components/loader.component';
import { RouterLink } from '@angular/router';

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
      <div class="hero-art"></div>
    </section>

    <section class="usps card-lite">
      <article><h3>Premium Beads</h3><p>Handpicked spiritual accessories</p></article>
      <article><h3>Free Shipping</h3><p>Across India on eligible orders</p></article>
      <article><h3>Assured Quality</h3><p>Trusted material authenticity</p></article>
    </section>

    <section id="collection" class="collection-intro">
      <h2>Featured Spiritual Picks</h2>
      <p>Minimal, elegant, and purpose-driven products inspired by premium storefront layouts.</p>
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

    <section class="cta card-lite">
      <h2>Interested? Explore The Full Devine Vibes Collection</h2>
      <p>Ground your routine with handcrafted spiritual pieces that blend tradition and premium style.</p>
      <a routerLink="/" class="btn primary">Go To Shop</a>
    </section>
  `,
  styles: [
    `.hero{display:grid;grid-template-columns:1.1fr 1fr;align-items:center;gap:2rem;padding:3rem;border-radius:0 0 42px 42px}`,
    `.eyebrow{font-weight:600;color:#d4af37}.hero h1{font-size:3.4rem;line-height:1.1;margin:.5rem 0 1rem;color:#1e2333}.sub{color:#525767;max-width:520px}`,
    `.hero-art{min-height:360px;background:url('https://images.unsplash.com/photo-1593691509543-c55fb32ddbd8?auto=format&fit=crop&w=1200&q=80') center/cover;border-radius:28px}`,
    `.usps{margin-top:1rem;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;padding:2rem}.usps h3{margin:0 0 .4rem;color:#1e2333}.usps p{margin:0;color:#61677a}`,
    `.collection-intro{text-align:center;padding:4rem 1rem 2rem}.collection-intro h2{font-size:3rem;color:#f5f2e8}.collection-intro p{color:#bcb4a0}`,
    `.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.2rem}`,
    `.cta{margin-top:3rem;text-align:center;padding:4rem 1rem 10rem;background-image:url('https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1400&q=80');background-size:cover;background-position:center}`,
    `.cta h2{font-size:3rem;max-width:820px;margin:0 auto 1rem;color:#f4f4f4}.cta p{max-width:760px;margin:0 auto 2rem;color:#f5ecd2}`,
    `@media (max-width:1000px){.hero{grid-template-columns:1fr}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.usps{grid-template-columns:1fr}} @media (max-width:640px){.grid{grid-template-columns:1fr}.hero h1,.collection-intro h2,.cta h2{font-size:2rem}}`
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

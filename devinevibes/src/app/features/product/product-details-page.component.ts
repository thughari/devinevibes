import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './product.service';
import { ProductResponse } from '../../shared/models/product.model';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-product-details-page',
  template: `
    @if (product(); as p) {
      <article class="card details">
        <img [src]="p.imageUrl || fallback" [alt]="p.name" />
        <div>
          <h2>{{ p.name }}</h2>
          <p>{{ p.description }}</p>
          <strong>₹ {{ p.price }}</strong>
          <button class="btn primary" (click)="add(p.id)">Add to Cart</button>
        </div>
      </article>
    }
  `,
  styles: [`.details{display:grid;grid-template-columns:1fr 1fr;gap:1rem} img{width:100%;border-radius:1rem;height:320px;object-fit:cover}`]
})
export class ProductDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  protected readonly product = signal<ProductResponse | null>(null);
  protected readonly fallback = 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=900&q=60';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.productService.getById(id).subscribe((res) => this.product.set(res));
  }

  add(productId: string): void {
    this.cartService.addToCart({ productId, quantity: 1 }).subscribe();
  }
}

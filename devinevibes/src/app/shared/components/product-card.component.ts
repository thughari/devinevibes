import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductResponse } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    <article class="product-card">
      <div class="thumb-wrap">
        <img [src]="product.imageUrl || fallback" [alt]="product.name" />
      </div>
      <small>Spiritual</small>
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <strong>₹ {{ product.price }}</strong>
      <div class="actions">
        <a class="btn" [routerLink]="['/products', product.id]">Details</a>
        <button class="btn primary" (click)="add.emit(product.id)">Add to Cart</button>
      </div>
    </article>
  `,
  styles: [
    `.product-card{background:#efefef;border-radius:10px;padding:.7rem;color:#1f2330}.thumb-wrap{background:#e5e5ea;border-radius:8px;overflow:hidden}`,
    `.product-card img{width:100%;height:290px;object-fit:cover;display:block}.product-card h3{margin:.4rem 0}.product-card p{color:#656b7e;min-height:48px}`,
    `.actions{display:flex;justify-content:space-between;gap:.4rem;margin-top:.75rem}.actions .btn{padding:.45rem .75rem}`
  ]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  @Output() add = new EventEmitter<string>();
  protected readonly fallback = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=60';
}

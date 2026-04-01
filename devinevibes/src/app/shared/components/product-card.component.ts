import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductResponse } from '../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    <article class="card product-card">
      <img [src]="product.imageUrl || fallback" [alt]="product.name" />
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <strong>₹ {{ product.price }}</strong>
      <div class="actions">
        <a class="btn" [routerLink]="['/products', product.id]">Details</a>
        <button class="btn primary" (click)="add.emit(product.id)">Add</button>
      </div>
    </article>
  `,
  styles: [`.product-card img{width:100%;height:220px;object-fit:cover;border-radius:.75rem}.actions{display:flex;justify-content:space-between;margin-top:.75rem} p{color:var(--muted);min-height:42px}`]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  @Output() add = new EventEmitter<string>();
  protected readonly fallback = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=60';
}

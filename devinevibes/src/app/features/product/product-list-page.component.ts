import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductService } from './product.service';
import { ProductResponse } from '../../shared/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { CartService } from '../cart/cart.service';
import { LoaderComponent } from '../../shared/components/loader.component';

@Component({
  selector: 'app-product-list-page',
  imports: [ProductCardComponent, LoaderComponent],
  template: `
    <section>
      <h1>Spiritual Collection</h1>
      @if (loading()) {
        <app-loader label="Loading sacred products..." />
      } @else {
        <div class="grid">
          @for (item of products(); track item.id) {
            <app-product-card [product]="item" (add)="addToCart($event)" />
          }
        </div>
      }
    </section>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}`]
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
}

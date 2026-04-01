import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ProductResponse } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly api: ApiService) {}

  getProducts(): Observable<ProductResponse[]> {
    return this.api.get<ProductResponse[]>('/products');
  }

  getById(id: string): Observable<ProductResponse> {
    return this.api.get<ProductResponse>(`/products/${id}`);
  }
}

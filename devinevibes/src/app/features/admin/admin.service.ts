import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { CreateProductRequest, ProductResponse } from '../../shared/models/product.model';
import { OrderResponse } from '../../shared/models/order.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly api: ApiService) {}

  getOrders(): Observable<OrderResponse[]> {
    return this.api.get<OrderResponse[]>('/admin/orders');
  }

  createProduct(payload: CreateProductRequest): Observable<ProductResponse> {
    return this.api.post<ProductResponse>('/admin/products', payload);
  }
}

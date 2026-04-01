import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { OrderRequest, OrderResponse, TrackingResponse } from '../../shared/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private readonly api: ApiService) {}

  placeOrder(payload: OrderRequest): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('/orders', payload);
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.api.get<OrderResponse[]>('/orders');
  }

  getTracking(orderId: string): Observable<TrackingResponse> {
    return this.api.get<TrackingResponse>(`/orders/${orderId}/tracking`);
  }
}

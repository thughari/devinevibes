export interface OrderResponse {
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  razorpayOrderId: string;
  trackingId: string;
}

export interface OrderRequest {
  shippingAddress: string;
}

export interface TrackingResponse {
  trackingId: string;
  orderStatus: string;
}

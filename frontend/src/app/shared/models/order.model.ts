export interface OrderItemResponse {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  razorpayOrderId: string;
  trackingId: string;
  courierName?: string;
  paymentMethod?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
  items?: OrderItemResponse[];
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingPhone?: string;
  shippingFirstName?: string;
  shippingLastName?: string;
  subtotalAmount?: number;
  shippingCost?: number;
  codFee?: number;
  couponDiscount?: number;
}

export interface OrderRequest {
  shippingAddress: string;
}

export interface ShipmentScan {
  date: string;
  activity: string;
  location: string;
}

export interface LiveTrackingResponse {
  courierName: string;
  currentStatus: string;
  estimatedDelivery: string;
  scans: ShipmentScan[];
}

export interface TrackingResponse {
  trackingId: string;
  orderStatus: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

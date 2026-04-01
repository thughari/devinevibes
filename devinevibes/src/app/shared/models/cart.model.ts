export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface CartItemResponse {
  cartItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

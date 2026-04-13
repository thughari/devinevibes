export type CouponType = 'FIXED' | 'BXGX';

export interface CouponResponse {
  id: string;
  code: string;
  type: CouponType;
  discountValue?: number;
  minimumCartValue?: number;
  buyQty?: number;
  getQty?: number;
  productId?: string;
  active: boolean;
  expiresAt?: string;
  maxUses?: number;
  maxUsesPerUser?: number;
  usageCount?: number;
}

export interface CreateCouponRequest {
  code: string;
  type: CouponType;
  discountValue?: number;
  minimumCartValue?: number;
  buyQty?: number;
  getQty?: number;
  productId?: string;
  active?: boolean;
  expiresAt?: string;
  maxUses?: number;
  maxUsesPerUser?: number;
}

export interface ApplyCouponResponse {
  code: string;
  discountAmount: number;
  finalTotal: number;
  message: string;
  productIdToAdd?: string;
  quantityToAdd?: number;
  freeQuantity?: number;
  targetProductId?: string;
}

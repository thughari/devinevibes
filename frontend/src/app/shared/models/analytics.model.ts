export interface TopSellingProductResponse {
  productId: string;
  productName: string;
  imageUrl: string;
  totalQuantitySold: number;
  totalRevenueGenerated: number;
}

export interface AnalyticsResponse {
  totalRevenue: number;
  prepaidRevenue: number;
  codRevenue: number;
  totalOrders: number;
  prepaidOrders: number;
  codOrders: number;
  topSellingProducts: TopSellingProductResponse[];
}

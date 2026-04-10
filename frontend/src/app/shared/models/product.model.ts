export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  categoryId?: string;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
}

export interface ProductResponse {
  id: string;
  productCode: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  categoryId?: string;
  categoryName?: string;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
  createdAt?: string;
  salesCount: number;
}

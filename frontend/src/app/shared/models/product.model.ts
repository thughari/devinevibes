export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

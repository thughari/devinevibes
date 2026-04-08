export interface Banner {
  id: string;
  content: string;
  type: 'INFO' | 'SALE' | 'ALERT';
  link?: string;
  priority: number;
  active: boolean;
  canDismiss: boolean;
  expiryDate?: string;
  createdAt: string;
}

export interface BannerRequest {
  content: string;
  type: 'INFO' | 'SALE' | 'ALERT';
  link?: string;
  priority: number;
  active: boolean;
  canDismiss: boolean;
  expiryDate?: string | null;
}



export enum ProductInputType {
  URL = 'URL',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface ProductInputData {
  type: ProductInputType;
  value: string;
}

export interface PriceData {
  month: string;
  price: number;
}

export interface Coupon {
  code: string;
  description: string;
}

export enum DealStatus {
    GOOD = "GOOD",
    AVERAGE = "AVERAGE",
    POOR = "POOR"
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  storeName: string;
  storeUrl: string;
  imageUrl: string;
  priceHistory: PriceData[];
  coupons: Coupon[];
  dealStatus: DealStatus;
  dealReasoning: string;
  notifications: boolean;
}
export type StorefrontProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  salePrice: string;
  isActive: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock?: boolean;
};

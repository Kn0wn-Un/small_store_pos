export type ProductError = {
  field: string;
  message: string;
  code?: string;
};

export type ProductResponse<TData = null> = {
  success: boolean;
  message: string;
  data: TData | null;
  errors?: ProductError[];
};

export type ProductItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  salePrice: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductListData = {
  items: ProductItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductMutationActor = {
  userId: string;
  role: "admin" | "cashier";
};

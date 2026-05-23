import { getServerSession } from "@/lib/auth/session";
import { POS_DEFAULT_PAGE_SIZE } from "../constants/pos.constants";
import { cartService } from "@/features/cart/services/cart.service";
import { getPosCartIdFromCookie } from "../utils/pos-cart-cookie";
import { listPosCategoriesService } from "./list-pos-categories.service";
import { listPosProductsService } from "./list-pos-products.service";
import type { PosCatalogData, PosCartData } from "../types/pos.types";

export async function loadPosPageData(): Promise<{
  session: { id: string; email: string; role: string };
  catalog: PosCatalogData;
  cart: PosCartData;
} | null> {
  const session = await getServerSession();
  if (!session) return null;

  const [productsResult, categoriesResult, cartId] = await Promise.all([
    listPosProductsService.execute({ page: 1, pageSize: POS_DEFAULT_PAGE_SIZE }),
    listPosCategoriesService.execute(),
    getPosCartIdFromCookie(),
  ]);

  const cartResult = cartId ? await cartService.getCart({ cartId }) : null;

  const products = productsResult.success && productsResult.data ? productsResult.data.products : [];
  const total = productsResult.success && productsResult.data ? productsResult.data.total : 0;
  const categories =
    categoriesResult.success && categoriesResult.data ? categoriesResult.data.categories : [];

  const emptyCart: PosCartData = {
    cartId: "",
    items: [],
    totals: { subtotal: "0.00", taxAmount: "0.00", discountAmount: "0.00", total: "0.00" },
  };

  const cart =
    cartResult?.success && cartResult.data ? cartResult.data : emptyCart;

  return {
    session: { id: session.id, email: session.email, role: session.role },
    catalog: { products, total, categories },
    cart,
  };
}

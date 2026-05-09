import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getFeaturedProductsAction } from "@/features/storefront/actions/get-featured-products.action";

export default async function ProductsPage() {
  const productsResult = await getFeaturedProductsAction(24);

  return (
    <>
      <Navbar />
      <ProductGrid products={productsResult.data ?? []} />
      <Footer />
    </>
  );
}

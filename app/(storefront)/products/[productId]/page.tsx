import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";
import { getStorefrontProductByIdAction } from "@/features/storefront/actions/get-featured-products.action";
import { getInventoryBadge } from "@/utils/storefront";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const result = await getStorefrontProductByIdAction(productId);

  if (!result.success || !result.data) {
    notFound();
  }

  const badge = getInventoryBadge(result.data.stockQuantity, result.data.lowStockThreshold);

  return (
    <>
      <Navbar />
      <section className="py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-2">
          <Image
            src={result.data.imageUrl ?? "https://images.unsplash.com/photo-1626201850129-a96f1f0d9f1e?q=80&w=1200&auto=format&fit=crop"}
            alt={result.data.name}
            width={1200}
            height={900}
            className="h-[560px] w-full rounded-[30px] object-cover shadow-lg"
          />
          <div className="shadcn-card rounded-[30px] p-10">
            <Badge className={`mb-4 border ${badge.className}`}>{badge.label}</Badge>
            <h1 className="heading-font navy mb-6 text-6xl font-bold">{result.data.name}</h1>
            <p className="subtext mb-8 text-lg leading-relaxed">{result.data.description ?? "Pure handcrafted product."}</p>
            <h2 className="navy text-5xl font-bold">₹{result.data.salePrice}</h2>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

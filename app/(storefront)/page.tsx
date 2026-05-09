import { CtaSection } from "@/components/storefront/cta-section";
import { FloatingParticles } from "@/components/storefront/floating-particles";
import { Footer } from "@/components/storefront/footer";
import { Hero } from "@/components/storefront/hero";
import { Navbar } from "@/components/storefront/navbar";
import { ProcessSection } from "@/components/storefront/process-section";
import { ProductGrid } from "@/components/storefront/product-grid";
import { WhatsAppFloat } from "@/components/storefront/whatsapp-float";
import { getFeaturedProductsAction } from "@/features/storefront/actions/get-featured-products.action";

export default async function StorefrontHomePage() {
  const productsResult = await getFeaturedProductsAction();

  return (
    <>
      <Navbar />
      <Hero />
      <ProductGrid products={productsResult.data ?? []} />
      <ProcessSection />
      <CtaSection />
      <Footer />
      <WhatsAppFloat />
      <FloatingParticles />
    </>
  );
}

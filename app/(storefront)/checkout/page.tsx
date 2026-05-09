import { CheckoutForm } from "@/components/storefront/checkout-form";
import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";

export default async function StorefrontCheckoutPage() {
  return (
    <>
      <Navbar />
      <section className="py-16">
        <div className="mx-auto w-full max-w-3xl px-6">
          <h1 className="heading-font navy mb-8 text-5xl font-bold">Checkout</h1>
          <CheckoutForm />
        </div>
      </section>
      <Footer />
    </>
  );
}

import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";
import { getStorefrontCartAction } from "@/features/storefront/actions/add-to-cart.action";

export default async function StorefrontCartPage() {
  const cartResult = await getStorefrontCartAction();
  const cart = cartResult.data;

  return (
    <>
      <Navbar />
      <section className="py-16">
        <div className="mx-auto w-full max-w-4xl px-6">
          <h1 className="heading-font navy mb-8 text-5xl font-bold">Cart</h1>
          {!cart?.items?.length ? (
            <p className="subtext">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.cartItemId} className="shadcn-card flex items-center justify-between rounded-2xl p-5">
                  <div>
                    <h3 className="navy font-semibold">{item.productName}</h3>
                    <p className="subtext text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="navy text-xl font-bold">₹{item.lineSubtotal}</p>
                </div>
              ))}
              <div className="mt-6 rounded-2xl border border-[#e7dcc2] bg-white p-5">
                <p>Subtotal: ₹{cart.totals.subtotal}</p>
                <p>Tax: ₹{cart.totals.taxAmount}</p>
                <p className="navy mt-2 text-xl font-bold">Total: ₹{cart.totals.total}</p>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function openRazorpayCheckout(options: RazorpayOptions) {
  if (typeof window === "undefined" || !window.Razorpay) {
    throw new Error("Razorpay SDK is not available.");
  }
  const instance = new window.Razorpay(options);
  instance.open();
}

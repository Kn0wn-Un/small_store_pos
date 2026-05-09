import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-6 pb-24">
      <div className="luxury-nav relative mx-auto w-full max-w-7xl overflow-hidden rounded-[40px] p-14 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 text-[250px] text-[#B69224] opacity-10">✿</div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div>
            <p className="mb-5 text-sm font-semibold tracking-[5px] text-[#B69224] uppercase">Monthly Subscription</p>
            <h2 className="heading-font mb-6 text-5xl font-bold text-white">Never Run Out Of Pure Oil Again</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
              Subscribe for monthly doorstep delivery and enjoy healthy cooking without compromise.
            </p>
          </div>
          <Button className="gold-bg px-10 py-5 text-xl font-semibold text-white shadow-lg whitespace-nowrap transition hover:scale-105">
            Start Subscription →
          </Button>
        </div>
      </div>
    </section>
  );
}

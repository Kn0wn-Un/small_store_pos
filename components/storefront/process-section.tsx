export function ProcessSection() {
  const steps = [
    { icon: "🌱", title: "Farm Sourcing", copy: "Carefully selected natural seeds from trusted farms." },
    { icon: "🪵", title: "Wood Pressed", copy: "Traditional slow extraction preserving nutrients." },
    { icon: "🫙", title: "Filtered Naturally", copy: "No industrial refining or chemical processing." },
    { icon: "🚚", title: "Delivered Fresh", copy: "Packed in small batches and shipped quickly." },
  ];

  return (
    <section id="process" className="bg-[#F8F5EF] py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-20 text-center">
          <p className="gold mb-4 text-sm font-semibold tracking-[5px] uppercase">Our Process</p>
          <h2 className="heading-font navy text-6xl font-bold">Crafted The Traditional Way</h2>
        </div>
        <div className="grid gap-10 text-center md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title}>
              <div className="gold mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#B69224] text-5xl">
                {step.icon}
              </div>
              <h3 className="navy mb-3 text-2xl font-bold">{step.title}</h3>
              <p className="subtext leading-relaxed">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

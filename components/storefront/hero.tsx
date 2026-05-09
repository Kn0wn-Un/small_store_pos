"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";

export function Hero() {
  useHeroAnimation("#storefront-hero");

  return (
    <section id="storefront-hero" className="relative overflow-hidden py-20 lg:py-28">
      <div className="luxury-overlay" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <p className="gold mb-5 text-sm font-semibold tracking-[5px] uppercase">Homemade • Organic • Traditional</p>
          <h1 className="heading-font hero-animate-title navy mb-8 text-6xl leading-none font-bold md:text-7xl">
            Pure Oil.<br />Honest Roots.
          </h1>
          <p className="subtext hero-animate-copy mb-10 max-w-xl text-xl leading-relaxed">
            Crafted in small batches using traditional wooden press methods. Every bottle carries the warmth of
            home, the scent of heritage, and the richness of real ingredients.
          </p>
          <div className="mb-16 flex flex-wrap gap-5">
            <Button className="gold-bg shine-btn px-8 py-4 text-lg text-white shadow-lg hover:scale-105">Explore Collection →</Button>
            <Button variant="outline" className="border-2 border-[#2C3E57] px-8 py-4 text-lg text-[#2C3E57] hover:bg-[#2C3E57] hover:text-white">
              Our Story
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: "🌿", title: "100%", subtitle: "Natural" },
              { icon: "🪵", title: "Wood", subtitle: "Pressed" },
              { icon: "🧪", title: "0%", subtitle: "Chemicals" },
              { icon: "🌱", title: "Farm", subtitle: "Fresh" },
            ].map((item) => (
              <div key={item.title}>
                <div className="gold mb-3 text-5xl">{item.icon}</div>
                <h3 className="navy text-4xl font-bold">{item.title}</h3>
                <p className="subtext mt-2">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="hero-shape absolute inset-0 border-2 border-[#B69224]" />
          <div className="hero-shape relative overflow-hidden bg-[#EFE6D7] p-8 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?q=80&w=1200&auto=format&fit=crop"
              alt="Premium oil showcase"
              width={1200}
              height={1400}
              className="h-[700px] w-full rounded-[40px] object-cover"
              priority
            />
          </div>
          <div className="absolute right-0 bottom-10 w-80 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="gold flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F1DB] text-4xl">✿</div>
              <div>
                <h3 className="heading-font navy text-3xl font-bold">Cold Pressed</h3>
                <p className="subtext mt-2 leading-relaxed">Rich nutrients preserved naturally</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

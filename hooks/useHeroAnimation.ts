"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

export function useHeroAnimation(containerSelector: string) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `${containerSelector} .hero-animate-title`,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.1, ease: "power2.out" },
      );
      gsap.fromTo(
        `${containerSelector} .hero-animate-copy`,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power2.out" },
      );
      gsap.fromTo(
        `${containerSelector} .hero-shape`,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, delay: 0.15, ease: "power2.out" },
      );
    });

    return () => ctx.revert();
  }, [containerSelector]);
}

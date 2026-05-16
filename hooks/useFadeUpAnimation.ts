"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function useFadeUpAnimation<T extends HTMLElement>(stagger = 0.12) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(".storefront-product-card");
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85, stagger, ease: "power2.out" },
      );
    }, container);

    return () => ctx.revert();
  }, [stagger]);

  return containerRef;
}

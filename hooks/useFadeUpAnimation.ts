"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

export function useFadeUpAnimation(selector: string, stagger = 0.12) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        selector,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85, stagger, ease: "power2.out" },
      );
    });

    return () => ctx.revert();
  }, [selector, stagger]);
}

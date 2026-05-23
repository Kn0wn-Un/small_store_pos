"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { POS_PRODUCT_CARD_CLASS } from "../constants/pos.constants";

export function usePosGridAnimation(deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(`.${POS_PRODUCT_CARD_CLASS}`);
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.06, ease: "power2.out" },
      );
    }, container);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

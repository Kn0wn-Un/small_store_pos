"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const ANALYTICS_CARD_CLASS = "analytics-stagger-card";

export function useAnalyticsStagger(deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(`.${ANALYTICS_CARD_CLASS}`);
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.08, ease: "power2.out" },
      );
    }, container);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

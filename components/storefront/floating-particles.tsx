"use client";

import { useMemo } from "react";

export function FloatingParticles() {
  const particles = useMemo(
    () => [
      { id: "p1", className: "top-20 left-10 w-6 h-6 bg-[#B69224]/20 animate-bounce" },
      { id: "p2", className: "top-1/3 right-20 w-10 h-10 bg-[#B69224]/10 animate-pulse" },
      { id: "p3", className: "bottom-20 left-1/4 w-8 h-8 bg-[#2C3E57]/10 animate-ping" },
    ],
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((particle) => (
        <div key={particle.id} className={`absolute rounded-full ${particle.className}`} />
      ))}
    </div>
  );
}

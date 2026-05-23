"use client";

import Link from "next/link";
import { CartSheet } from "./cart-sheet";

export function Navbar() {
  return (
    <header className="luxury-nav sticky top-0 z-50 shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3">
        <div>
          <h1 className="heading-font text-5xl leading-none tracking-wide text-white">SATHVAM</h1>
          <div className="mt-1 flex items-center gap-3">
            <div className="gold-bg h-[2px] w-20" />
            <div className="text-2xl text-[#B69224]">✿</div>
            <div className="gold-bg h-[2px] w-20" />
          </div>
          <p className="mt-1 text-xs tracking-[4px] text-gray-200 uppercase">Purity At Its Best</p>
        </div>

        <nav className="hidden items-center gap-10 text-sm font-medium lg:flex text-white">
          <Link href="/" className="transition hover:text-[#B69224]">Home</Link>
          <Link href="/products" className="transition hover:text-[#B69224]">Products</Link>
          <a href="#process" className="transition hover:text-[#B69224]">Our Process</a>
          <a href="#about" className="transition hover:text-[#B69224]">About Us</a>
          <a href="#contact" className="transition hover:text-[#B69224]">Contact</a>
        </nav>

        <CartSheet />
      </div>
    </header>
  );
}

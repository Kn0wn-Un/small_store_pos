export function Footer() {
  return (
    <footer id="contact" className="luxury-nav py-20 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 md:grid-cols-4">
        <div id="about">
          <h2 className="heading-font mb-4 text-5xl text-white">SATHVAM</h2>
          <p className="mb-8 leading-relaxed text-gray-300">Traditional oils crafted with honesty, purity, and heritage.</p>
          <div className="flex gap-4 text-2xl">
            {["f", "◎", "◉"].map((icon) => (
              <div
                key={icon}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-400 transition hover:border-[#B69224]"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-2xl font-semibold text-[#B69224]">Company</h3>
          <ul className="space-y-4 text-gray-300">
            <li>About Us</li>
            <li>Our Story</li>
            <li>Careers</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-2xl font-semibold text-[#B69224]">Products</h3>
          <ul className="space-y-4 text-gray-300">
            <li>Sesame Oil</li>
            <li>Coconut Oil</li>
            <li>Groundnut Oil</li>
            <li>All Products</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-2xl font-semibold text-[#B69224]">Contact</h3>
          <ul className="space-y-4 leading-relaxed text-gray-300">
            <li>Bangalore, India</li>
            <li>hello@sathvam.com</li>
            <li>+91 9876543210</li>
          </ul>
        </div>
      </div>
      <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-gray-400">©️ 2026 Sathvam. All rights reserved.</div>
    </footer>
  );
}

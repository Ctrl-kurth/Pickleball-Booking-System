import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex justify-between h-20 md:h-24 items-center">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center min-h-[44px] min-w-[44px]">
              <div className="relative h-12 w-12 md:h-20 md:w-20 group-hover:scale-105 transition-transform duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pb4_clean.png?v=4"
                  alt="PB4 Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-10">
              <div className="flex items-center space-x-8 text-sm font-bold tracking-tight text-zinc-400">

                <a href="#about" className="hover:text-white transition-colors">About</a>
              </div>
            </div>
            <a href="#booking" className="flex items-center justify-center min-h-[44px] min-w-[44px] bg-green-400 text-black px-6 py-3 rounded-full font-black text-xs md:text-sm uppercase tracking-wider hover:bg-green-300 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] active:scale-95">
              Book Now
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

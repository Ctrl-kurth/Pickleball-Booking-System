import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between h-24 items-center">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <div className="relative h-20 w-20 group-hover:scale-105 transition-transform duration-500">
                <img
                  src="/pb4_clean.png?v=4"
                  alt="PB4 Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <div className="flex items-center space-x-8 text-sm font-bold tracking-tight text-zinc-400">
              <Link href="/bookings" className="hover:text-white transition-colors">My Profile</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
            </div>
            <a href="#booking" className="bg-green-400 text-black px-6 py-2.5 rounded font-black text-sm uppercase tracking-wider hover:bg-green-300 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)]">
              Book Now
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

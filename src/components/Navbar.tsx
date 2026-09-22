import React from 'react';
import { ShoppingBag, Search, Menu, X, Compass } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenTrackOrder,
  onNavigateHome
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#eee8de]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={onNavigateHome}
            className="flex flex-col text-left group transition-transform focus:outline-none"
          >
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#151515] group-hover:text-[#a88849] transition-colors">
              A.ROYAL
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8b7650] font-semibold">
              Luxury That Defines You
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] uppercase tracking-[0.14em] font-medium text-[#444]">
            <a
              href="#hero"
              className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all"
            >
              Home
            </a>
            <a
              href="#watches"
              className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all"
            >
              Watches
            </a>
            <a
              href="#perfumes"
              className="hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all"
            >
              Perfumes
            </a>
            <button
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1.5 hover:text-[#151515] hover:border-b-2 hover:border-[#c9ad79] pb-1 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#8b7650]" />
              Track Order
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Track Order quick button */}
            <button
              onClick={onOpenTrackOrder}
              title="Track Order"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 text-[#666] hover:text-[#151515] hover:bg-[#eee8de]/50 rounded transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track</span>
            </button>

            {/* Cart Bag */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-[#151515] text-white px-3.5 py-2 rounded sm:px-4 sm:py-2.5 hover:bg-[#2b2b2b] transition-colors"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#c9ad79]" />
              <span className="text-xs font-semibold uppercase tracking-wider">Bag</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-[#151515] bg-[#c9ad79] rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-black"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#eee8de] bg-[#faf9f6] flex flex-col gap-3 text-sm font-medium">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-2 hover:bg-[#eee8de] rounded transition-colors"
            >
              Home
            </a>
            <a
              href="#watches"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-2 hover:bg-[#eee8de] rounded transition-colors"
            >
              Watches
            </a>
            <a
              href="#perfumes"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-2 hover:bg-[#eee8de] rounded transition-colors"
            >
              Perfumes
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrackOrder();
              }}
              className="text-left px-2 py-2 hover:bg-[#eee8de] rounded transition-colors flex items-center gap-2 text-[#8b7650]"
            >
              <Compass className="w-4 h-4" />
              Track Order Status
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

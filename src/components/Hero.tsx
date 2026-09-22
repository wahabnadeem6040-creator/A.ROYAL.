import React from 'react';
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw, Award } from 'lucide-react';

interface HeroProps {
  onExploreWatches: () => void;
  onExplorePerfumes: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreWatches, onExplorePerfumes }) => {
  return (
    <section id="hero" className="relative pt-8 pb-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3ede3] text-[#8b7650] border border-[#e5dcce]">
              <Sparkles className="w-3.5 h-3.5 text-[#a88849]" />
              <span className="eyebrow !text-[10px] tracking-[0.2em]">A New Standard of Luxury</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#151515] leading-[1.1] font-medium tracking-tight">
              Luxury That <br />
              <span className="italic font-normal text-[#8b7650]">Defines You.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#555] max-w-xl font-light leading-relaxed">
              Discover curated chronographs, automatic timepieces, and signature oriental fragrances
              engineered to become an enduring statement of your presence.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreWatches}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#151515] text-white text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#2e2e2e] transition-all transform hover:-translate-y-0.5 shadow-sm"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 text-[#c9ad79]" />
              </button>

              <button
                onClick={onExplorePerfumes}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#151515] border border-[#dfd8cc] text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#faf8f5] hover:border-[#151515] transition-all"
              >
                <span>Explore Scents</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-[#eee8de] grid grid-cols-3 gap-6">
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#151515]">100%</p>
                <p className="text-[11px] uppercase tracking-wider text-[#777] mt-0.5">Authentic</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#151515]">316L</p>
                <p className="text-[11px] uppercase tracking-wider text-[#777] mt-0.5">Steel & Oud</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#151515]">COD</p>
                <p className="text-[11px] uppercase tracking-wider text-[#777] mt-0.5">Nationwide</p>
              </div>
            </div>
          </div>

          {/* Right Column: Luxury Art Visual Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-sm overflow-hidden bg-gradient-to-br from-[#ddd7cb] via-[#b3a898] to-[#8d8578] shadow-2xl border border-[#d6cec0]">
              <div className="h-[440px] sm:h-[500px] flex items-center justify-center relative p-8">
                {/* Background Watermark */}
                <span className="absolute font-serif text-7xl sm:text-9xl font-bold text-white/20 select-none tracking-widest -rotate-12 pointer-events-none">
                  A.ROYAL
                </span>

                {/* Featured Foreground Imagery */}
                <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6">
                  {/* Watch Spotlight */}
                  <div className="w-44 sm:w-56 bg-white/90 backdrop-blur-md p-3 rounded shadow-xl border border-white/60 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="aspect-[4/5] overflow-hidden rounded bg-neutral-100 mb-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80"
                        alt="Royal Chronograph"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="eyebrow !text-[9px]">Master Watchmaker</p>
                    <p className="font-serif text-sm font-semibold text-[#151515]">Royal Chronograph</p>
                    <p className="text-xs font-semibold text-[#8b7650] mt-0.5">PKR 24,999</p>
                  </div>

                  {/* Perfume Spotlight */}
                  <div className="w-40 sm:w-52 bg-white/95 backdrop-blur-md p-3 rounded shadow-xl border border-white/60 transform rotate-3 hover:rotate-0 transition-transform duration-500 mt-10">
                    <div className="aspect-[4/5] overflow-hidden rounded bg-neutral-100 mb-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80"
                        alt="Royal Oud Perfume"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="eyebrow !text-[9px]">Haute Parfumerie</p>
                    <p className="font-serif text-sm font-semibold text-[#151515]">Royal Oud Extrait</p>
                    <p className="text-xs font-semibold text-[#8b7650] mt-0.5">PKR 7,499</p>
                  </div>
                </div>

                {/* Floating Seal */}
                <div className="absolute bottom-4 right-4 bg-[#151515]/90 backdrop-blur-md text-[#c9ad79] px-3.5 py-1.5 rounded text-[10px] tracking-widest uppercase font-semibold border border-[#c9ad79]/30">
                  Curated Edition
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Perks Strip */}
        <div className="mt-14 pt-8 border-t border-[#eee8de] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#f2ecdf] flex items-center justify-center text-[#8b7650] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#151515] uppercase tracking-wider">Free Delivery</p>
              <p className="text-[11px] text-[#666]">Insured shipment nationwide</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#f2ecdf] flex items-center justify-center text-[#8b7650] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#151515] uppercase tracking-wider">Cash on Delivery</p>
              <p className="text-[11px] text-[#666]">Inspect before you pay</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#f2ecdf] flex items-center justify-center text-[#8b7650] shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#151515] uppercase tracking-wider">100% Genuine</p>
              <p className="text-[11px] text-[#666]">Direct from master artisans</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#f2ecdf] flex items-center justify-center text-[#8b7650] shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#151515] uppercase tracking-wider">7-Day Exchange</p>
              <p className="text-[11px] text-[#666]">Peace of mind guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { MessageCircle, Phone, Mail, Compass } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenTrackOrder,
  onOpenAdmin
}) => {
  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-white border-t border-[#eee8de] text-xs text-[#666]">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div>
              <span className="font-serif text-2xl font-bold tracking-wider text-[#151515]">
                A.ROYAL
              </span>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#8b7650] font-semibold mt-0.5">
                Luxury That Defines You
              </p>
            </div>
            <p className="text-xs text-[#777] leading-relaxed">
              Curated luxury chronographs, automatic timepieces, and signature oriental extrait de
              parfums handcrafted for discerning clientele across Pakistan.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#151515]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#watches" className="hover:text-[#151515] transition-colors">
                  Precision Watches
                </a>
              </li>
              <li>
                <a href="#perfumes" className="hover:text-[#151515] transition-colors">
                  Signature Perfumes & Oud
                </a>
              </li>
              <li>
                <a href="#hero" className="hover:text-[#151515] transition-colors">
                  Featured Timepieces
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#151515]">
              Concierge & Orders
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-[#151515] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Compass className="w-3.5 h-3.5 text-[#8b7650]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <span className="text-[#888]">Nationwide Insured Delivery (COD)</span>
              </li>
              <li>
                <span className="text-[#888]">7-Day Exchange Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Contact Concierge */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#151515]">
              Contact Concierge
            </h4>
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-medium"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: {settings.whatsappNumber}</span>
              </a>
              <div className="flex items-center gap-2 text-[#777]">
                <Phone className="w-4 h-4 text-[#8b7650]" />
                <span>Call Center: {settings.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#777]">
                <Mail className="w-4 h-4 text-[#8b7650]" />
                <span>concierge@aroyal.pk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#eee8de] py-6 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
          <p>
            <strong className="text-[#151515]">A.ROYAL</strong> — Luxury That Defines You. Handcrafted
            for excellence.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-[11px] text-neutral-400 hover:text-neutral-700"
            >
              Admin Security Login
            </button>
            <span>© 2026 A.ROYAL. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

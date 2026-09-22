import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  whatsappNumber: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  whatsappNumber
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

  const generateWhatsAppMessage = () => {
    let msg = `*A.ROYAL Luxury Order Request*\n\n`;
    items.forEach((item, index) => {
      msg += `${index + 1}. *${item.product.name}* (${item.product.category})\n`;
      msg += `   Qty: ${item.quantity} × PKR ${item.product.price.toLocaleString()}\n`;
      msg += `   Subtotal: PKR ${(item.product.price * item.quantity).toLocaleString()}\n\n`;
    });
    msg += `*Estimated Total: PKR ${subtotal.toLocaleString()}*\n`;
    msg += `Payment Preference: Cash on Delivery (COD)\n\n`;
    msg += `Please confirm my order and advise on delivery schedule. Thank you!`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#faf9f6] h-full shadow-2xl flex flex-col z-10 border-l border-[#eee8de]">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#eee8de] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#8b7650]" />
            <h3 className="font-serif text-lg font-semibold text-[#151515]">Shopping Bag</h3>
            <span className="text-xs bg-[#f4efe6] text-[#8b7650] font-bold px-2 py-0.5 rounded-full">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Alert Banner */}
        <div className="bg-[#f5ede0] border-b border-[#ebdcc6] px-5 py-2.5 text-xs text-[#8b7650] flex items-center justify-between font-medium">
          <span>Complimentary Insured Delivery Across Pakistan</span>
          <span className="font-bold text-[#151515]">FREE</span>
        </div>

        {/* Drawer Items Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f4efe6] flex items-center justify-center text-[#8b7650]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="font-serif text-xl font-medium text-[#151515]">Your Bag is Empty</h4>
              <p className="text-xs text-[#777] max-w-xs leading-relaxed">
                Discover curated luxury timepieces and signature fragrances crafted to elevate your
                presence.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white border border-[#eee8de] p-3 rounded-sm flex gap-3.5 shadow-sm"
              >
                <div className="w-20 h-20 bg-[#f4efe6] shrink-0 overflow-hidden rounded-sm">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] uppercase tracking-wider text-[#8b7650] font-bold">
                        {item.product.category}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-serif text-sm font-medium text-[#151515] line-clamp-1 mt-0.5">
                      {item.product.name}
                    </h4>

                    <p className="text-xs font-bold text-[#151515] mt-1">
                      PKR {item.product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f8f5ee]">
                    <div className="inline-flex items-center border border-[#dfd8cc] bg-[#faf8f5]">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-[#eee8de]"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-bold text-[#151515]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-[#eee8de] disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-[#8b7650]">
                      PKR {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#eee8de] bg-white space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-medium text-neutral-900">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Insured Nationwide Shipping</span>
                <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#151515] pt-2 border-t border-[#eee8de]">
                <span>Total</span>
                <span className="text-lg font-serif">PKR {subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* COD reassurance badge */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on Delivery (COD) Available</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-[0.14em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${cleanWaNumber}?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25d366] text-white hover:bg-[#20ba5a] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Order Instantly on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

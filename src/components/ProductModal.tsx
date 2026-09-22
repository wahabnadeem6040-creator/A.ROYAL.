import React from 'react';
import { X, ShoppingBag, Truck, ShieldCheck, MessageCircle, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  whatsappNumber: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  whatsappNumber
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    setQuantity(1);
    setAdded(false);
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    onBuyNow(product, quantity);
  };

  const waMessage = encodeURIComponent(
    `Hello A.ROYAL! I am interested in purchasing:
Product: ${product.name}
Category: ${product.category}
Price: PKR ${product.price.toLocaleString()}
Quantity: ${quantity}
Link: ${window.location.origin}/#${product.id}`
  );

  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#faf9f6] w-full max-w-4xl border border-[#eee8de] shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-neutral-600 hover:text-black rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Side */}
          <div className="bg-[#f4efe6] relative aspect-square md:aspect-auto md:h-full flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#151515] text-[#c9ad79] text-[10px] font-bold tracking-widest uppercase">
                A.ROYAL Signature
              </span>
            )}
          </div>

          {/* Info Side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="eyebrow">{product.category}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    product.stock > 0
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Sold Out'}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#151515] mt-2 mb-3">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-[#151515]">
                  PKR {product.price.toLocaleString()}
                </span>
                {product.old_price && (
                  <span className="text-sm text-neutral-400 line-through">
                    PKR {product.old_price.toLocaleString()}
                  </span>
                )}
                {product.old_price && (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Save PKR {(product.old_price - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-sm text-[#555] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Specifications / Fragrance Profile */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6 p-4 bg-white border border-[#eee8de] rounded-sm space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8b7650]">
                    {product.category === 'Perfumes' ? 'Fragrance Pyramid' : 'Horological Details'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[#888] font-medium text-[11px]">{key}</span>
                        <span className="text-[#151515] font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs uppercase font-semibold tracking-wider text-[#666]">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center border border-[#dfd8cc] bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-neutral-600 hover:bg-[#eee8de] transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-[#151515] min-w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-neutral-600 hover:bg-[#eee8de] transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-neutral-400">
                    Max: {product.stock}
                  </span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-[#eee8de]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 px-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    product.stock <= 0
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-[#151515] border border-[#151515] hover:bg-[#151515] hover:text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#c9ad79]" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 px-4 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>Buy Now (COD)</span>
                </button>
              </div>

              {/* Direct WhatsApp Order */}
              <a
                href={`https://wa.me/${cleanWaNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#25d366]/10 text-[#128c7e] hover:bg-[#25d366] hover:text-white border border-[#25d366]/40 rounded-sm text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp Direct</span>
              </a>

              {/* Trust Micro-bar */}
              <div className="flex items-center justify-between text-[11px] text-[#777] pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#8b7650]" /> Free Express Shipping
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" /> Authenticity Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

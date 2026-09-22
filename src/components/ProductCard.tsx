import React from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView
}) => {
  const [added, setAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group bg-white border border-[#eee8de] flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer relative overflow-hidden"
    >
      {/* Product Image Area */}
      <div className="relative h-80 sm:h-96 w-full bg-[#f6f2ea] overflow-hidden flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] uppercase bg-[#151515]/90 backdrop-blur-md text-[#e5c07b] rounded-sm">
              Featured
            </span>
          )}
          {product.old_price && (
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-[#a88849] text-white rounded-sm">
              Save PKR {(product.old_price - product.price).toLocaleString()}
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-amber-600 text-white rounded-sm">
              Only {product.stock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-red-800 text-white rounded-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute inset-x-4 bottom-3 hidden group-hover:flex items-center justify-center gap-1.5 py-2.5 bg-white/95 backdrop-blur-md text-[#151515] text-[11px] font-semibold uppercase tracking-wider shadow-md hover:bg-[#151515] hover:text-white transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View Details</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#8b7650] font-semibold">
              {product.category}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-medium text-[#151515] mt-1.5 mb-1 group-hover:text-[#a88849] transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-[#f4efe6]">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-[#151515]">
                PKR {product.price.toLocaleString()}
              </span>
              {product.old_price && (
                <span className="text-xs text-neutral-400 line-through">
                  PKR {product.old_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#faf8f5] text-[#151515] border border-[#dfd8cc] hover:bg-[#151515] hover:text-white hover:border-[#151515]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#c9ad79]" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

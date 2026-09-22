import React, { useState } from 'react';
import { X, Search, Package, Clock, CheckCircle2, Truck, AlertCircle, MessageCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { trackOrder } from '../lib/api';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

const STATUS_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered'
];

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await trackOrder(query.trim());
      setOrder(result);
    } catch (err: any) {
      setError(err.message || 'No order found with this ID or phone number.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#faf9f6] w-full max-w-2xl border border-[#eee8de] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-[#eee8de] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8b7650]" />
            <h3 className="font-serif text-lg font-semibold text-[#151515]">
              Track Your Royal Order
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#666]">
              Enter Order ID (e.g. ROYAL-7819) or Registered Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="ROYAL-7819 or 0300 1234567"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 p-3 bg-white border border-[#dfd8cc] rounded text-sm focus:outline-none focus:border-[#151515]"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#888]">
              You can find your Order ID on your confirmation screen or SMS / WhatsApp receipt.
            </p>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Result Card */}
          {order && (
            <div className="bg-white border border-[#eee8de] p-5 sm:p-6 rounded space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#eee8de]">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b7650]">
                    Order Reference
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-[#151515]">
                    {order.id}
                  </h4>
                  <p className="text-xs text-[#777]">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-xs font-bold text-[#151515] mt-1">
                    Total: PKR {order.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Stepper */}
              {order.status !== 'Cancelled' ? (
                <div className="space-y-3">
                  <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#8b7650]">
                    Fulfillment Progress
                  </h5>
                  <div className="grid grid-cols-5 gap-2 relative">
                    {STATUS_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(order.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isComplete
                                ? 'bg-[#151515] text-[#c9ad79]'
                                : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                            } ${isCurrent ? 'ring-2 ring-[#c9ad79] ring-offset-2' : ''}`}
                          >
                            {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[9px] sm:text-[10px] mt-1.5 font-semibold ${
                              isComplete ? 'text-[#151515]' : 'text-neutral-400'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  This order was cancelled. Please contact customer concierge on WhatsApp for assistance.
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2 pt-2 border-t border-[#eee8de]">
                <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#8b7650]">
                  Purchased Items ({order.items.length})
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded bg-neutral-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-semibold text-[#151515]">{item.name}</p>
                          <p className="text-[11px] text-[#777]">
                            Qty: {item.quantity} × PKR {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#151515]">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Delivery info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#faf8f5] p-3 rounded border border-[#eee8de]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#888]">Customer</p>
                  <p className="font-semibold text-[#151515]">{order.customer.name}</p>
                  <p className="text-neutral-600">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#888]">Delivery Address</p>
                  <p className="text-neutral-700">{order.customer.address}, {order.customer.city}</p>
                  <p className="text-[11px] text-[#8b7650] font-medium">{order.paymentMethod}</p>
                </div>
              </div>

              {/* WhatsApp Support Button */}
              <a
                href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
                  `Hello A.ROYAL team! I am inquiring about Order ID: ${order.id}. Current status: ${order.status}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#25d366]/10 text-[#128c7e] hover:bg-[#25d366] hover:text-white border border-[#25d366]/40 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Concierge on WhatsApp about this Order</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

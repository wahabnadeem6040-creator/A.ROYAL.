import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Truck, MessageCircle, AlertCircle, Copy, Check, Mail } from 'lucide-react';
import { CartItem, Order, PaymentMethod, StoreSettings } from '../types';
import { placeOrder } from '../lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
  settings: StoreSettings;
}

const PAKISTANI_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Quetta',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Other'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  settings
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: 'Karachi',
    customCity: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery (COD)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalCity = formData.city === 'Other' ? formData.customCity.trim() : formData.city;

    if (!formData.name.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide your active phone number');
      return;
    }
    if (!formData.address.trim()) {
      setError('Please enter complete delivery address');
      return;
    }
    if (!finalCity) {
      setError('Please select or specify your city');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim() || 'guest@aroyal.pk',
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
          address: formData.address.trim(),
          city: finalCity,
          notes: formData.notes.trim()
        },
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity
        })),
        paymentMethod
      };

      const createdOrder = await placeOrder(orderPayload);
      setPlacedOrder(createdOrder);
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    if (!placedOrder) return;
    navigator.clipboard.writeText(placedOrder.id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const cleanWaNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const getWhatsAppConfirmationUrl = () => {
    if (!placedOrder) return '#';
    const text = encodeURIComponent(
      `Hello A.ROYAL team!\nI have placed an order.\n\n*Order ID: ${placedOrder.id}*\n*Customer: ${placedOrder.customer.name}*\n*City: ${placedOrder.customer.city}*\n*Total: PKR ${placedOrder.total.toLocaleString()}*\n*Payment: ${placedOrder.paymentMethod}*\n\nPlease confirm dispatch. Thank you!`
    );
    return `https://wa.me/${cleanWaNumber}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#faf9f6] w-full max-w-3xl border border-[#eee8de] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-[#eee8de] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[#151515]">A.ROYAL</span>
            <span className="text-neutral-300">|</span>
            <span className="text-xs uppercase tracking-wider text-[#8b7650] font-semibold">
              {placedOrder ? 'Order Confirmation' : 'Secure Luxury Checkout'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {placedOrder ? (
          /* Order Confirmation View */
          <div className="p-6 sm:p-10 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="inline-block px-3 py-1 bg-[#f4efe6] text-[#8b7650] text-[10px] uppercase font-bold tracking-widest rounded-full">
                Order Received Successfully
              </div>

              <h2 className="font-serif text-3xl font-medium text-[#151515]">
                Thank You, {placedOrder.customer.name}
              </h2>

              <p className="text-sm text-[#666] max-w-md mx-auto">
                Your luxury order has been recorded into our royal dispatch registry. Our concierge
                will contact you shortly for dispatch verification.
              </p>
            </div>

            {/* Order ID Banner */}
            <div className="p-4 bg-white border border-[#dfd8cc] rounded flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#888] font-bold">Your Order ID</p>
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#151515] tracking-wider">
                  {placedOrder.id}
                </p>
              </div>

              <button
                onClick={copyOrderId}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4efe6] hover:bg-[#ebdcc6] text-xs font-semibold text-[#8b7650] rounded transition-colors"
              >
                {copiedOrderId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOrderId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Live Order Dispatch Email Confirmation */}
            <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded flex items-center gap-2.5 text-xs text-amber-900">
              <Mail className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Full order invoice alert has been dispatched to <strong>{settings?.adminEmail || 'wahab.nadeem6040@gmail.com'}</strong>. Our concierge will call or message your WhatsApp shortly.
              </span>
            </div>

            {/* Receipt Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 border border-[#eee8de] rounded space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[#8b7650] text-[11px]">
                  Delivery Information
                </h4>
                <p><strong>Name:</strong> {placedOrder.customer.name}</p>
                <p><strong>Phone:</strong> {placedOrder.customer.phone}</p>
                <p><strong>City:</strong> {placedOrder.customer.city}</p>
                <p><strong>Address:</strong> {placedOrder.customer.address}</p>
                {placedOrder.customer.notes && (
                  <p><strong>Notes:</strong> {placedOrder.customer.notes}</p>
                )}
              </div>

              <div className="bg-white p-4 border border-[#eee8de] rounded space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[#8b7650] text-[11px]">
                  Order & Payment Summary
                </h4>
                <p><strong>Payment Method:</strong> {placedOrder.paymentMethod}</p>
                <p><strong>Payment Status:</strong> {placedOrder.paymentStatus}</p>
                <p><strong>Status:</strong> <span className="text-amber-800 font-bold">{placedOrder.status}</span></p>
                <p><strong>Total Amount:</strong> <span className="text-sm font-bold text-[#151515]">PKR {placedOrder.total.toLocaleString()}</span></p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={getWhatsAppConfirmationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#25d366] text-white hover:bg-[#20ba5a] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Confirm Order via WhatsApp Concierge</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Input Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <h4 className="font-serif text-base font-semibold text-[#151515] pb-2 border-b border-[#eee8de]">
                  1. Shipping & Customer Details
                </h4>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wahab Nadeem"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@luxury.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                    >
                      {PAKISTANI_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.city === 'Other' && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                        Specify City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your city name"
                        value={formData.customCity}
                        onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                        className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                    Complete Shipping Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Apartment #, Street, Phase/Block, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Call before arrival, ring bell, gift packaging"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#dfd8cc] rounded text-xs focus:outline-none focus:border-[#151515]"
                  />
                </div>
              </div>

              {/* Payment & Order Summary */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#151515] pb-2 border-b border-[#eee8de]">
                    2. Payment Method
                  </h4>

                  <div className="space-y-2.5 mt-3">
                    <label
                      className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-all ${
                        paymentMethod === 'Cash on Delivery (COD)'
                          ? 'border-[#151515] bg-[#faf8f5]'
                          : 'border-[#dfd8cc] bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'Cash on Delivery (COD)'}
                        onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#151515]">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666] mt-0.5">
                          Pay with cash when your package is delivered to your doorstep.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-all ${
                        paymentMethod === 'Direct Bank Transfer'
                          ? 'border-[#151515] bg-[#faf8f5]'
                          : 'border-[#dfd8cc] bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'Direct Bank Transfer'}
                        onChange={() => setPaymentMethod('Direct Bank Transfer')}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#151515]">
                          Direct Bank Transfer / Raast
                        </span>
                        <p className="text-[11px] text-[#666] mt-0.5">
                          Transfer directly to our official corporate Meezan Bank account.
                        </p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'Direct Bank Transfer' && settings.bankDetails && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-1 mt-2 text-amber-900">
                      <p className="font-bold">A.ROYAL Bank Account Details:</p>
                      <p>Bank: {settings.bankDetails.bankName}</p>
                      <p>Title: {settings.bankDetails.accountTitle}</p>
                      <p>Account #: {settings.bankDetails.accountNumber}</p>
                      <p>IBAN: {settings.bankDetails.iban}</p>
                      <p className="text-[11px] text-amber-700 italic">
                        Please send screenshot of transfer on WhatsApp after placing order.
                      </p>
                    </div>
                  )}

                  {/* Order Items Snapshot */}
                  <div className="mt-5 pt-4 border-t border-[#eee8de]">
                    <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#8b7650] mb-2">
                      Order Summary ({items.length} items)
                    </h5>

                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-neutral-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#151515]">{item.quantity}×</span>
                            <span className="text-neutral-700 line-clamp-1">{item.product.name}</span>
                          </div>
                          <span className="font-medium">
                            PKR {(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#eee8de] space-y-1.5 text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span>
                        <span>PKR {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Shipping</span>
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">Free Insured Delivery</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-[#151515] pt-1">
                        <span>Grand Total</span>
                        <span className="font-serif">PKR {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 bg-[#151515] text-[#c9ad79] text-xs font-semibold uppercase tracking-[0.15em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Placing Order in Registry...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#c9ad79]" />
                        <span>Confirm & Place Order (PKR {total.toLocaleString()})</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#8b7650]" /> 2-4 Days Delivery
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8b7650]" /> 100% Genuine
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

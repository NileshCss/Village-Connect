'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { formatPrice, STATES } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'upi', label: 'UPI / QR Code', icon: '📱' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const supabase = createClient();

  const subtotal = totalPrice();
  const delivery = subtotal >= 499 ? 0 : 49;
  const total = subtotal + delivery;

  const updateAddress = (field: string, value: string) => setAddress((a) => ({ ...a, [field]: value }));

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const missing = required.filter((field) => !address[field as keyof typeof address]?.trim());
    if (missing.length > 0) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please login to place an order'); router.push('/auth/login'); return; }

      // @ts-ignore
      const { data: orderData, error } = await supabase.from('orders').insert({ user_id: user.id, status: 'pending', total_amount: total, delivery_address: address, payment_method: paymentMethod, payment_status: paymentMethod === 'cod' ? 'pending' : 'paid' } as any).select().single();
      const order = orderData as any;

      if (error || !order) throw new Error('Failed to create order');

      // @ts-ignore
      await supabase.from('order_items').insert(items.map(({ product, quantity }) => ({ order_id: order.id, product_id: product.id, quantity, unit_price: product.price, total_price: product.price * quantity })));

      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders/${order.id}?success=true`);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No items in cart</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {[
            { n: 1, label: 'Address', icon: MapPin },
            { n: 2, label: 'Payment', icon: CreditCard },
            { n: 3, label: 'Review', icon: CheckCircle },
          ].map(({ n, label, icon: Icon }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= n ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > n ? '✓' : n}
              </div>
              <span className={`text-sm font-medium ${step >= n ? 'text-primary-700' : 'text-gray-400'}`}>{label}</span>
              {n < 3 && <div className={`hidden sm:block w-12 h-0.5 ${step > n ? 'bg-primary-700' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-800 mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-700" /> Delivery Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { field: 'fullName', label: 'Full Name', placeholder: 'Your name', span: 1 },
                    { field: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', span: 1 },
                    { field: 'addressLine1', label: 'Address Line 1', placeholder: 'House/Flat number, Street', span: 2 },
                    { field: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Area, Landmark', span: 2 },
                    { field: 'city', label: 'City', placeholder: 'City', span: 1 },
                    { field: 'pincode', label: 'Pincode', placeholder: '560001', span: 1 },
                  ].map(({ field, label, placeholder, span }) => (
                    <div key={field} className={span === 2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={(address as any)[field]}
                        onChange={(e) => updateAddress(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                    <select
                      value={address.state}
                      onChange={(e) => updateAddress('state', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select State</option>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => validateAddress() && setStep(2)}
                  className="btn-primary mt-6 w-full justify-center">
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-800 mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-700" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                      <input type="radio" value={method.value} checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)} className="accent-primary-600" />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium text-gray-800">{method.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 justify-center">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-bold text-lg text-gray-800 mb-5 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary-700" /> Review Order
                </h2>

                {/* Address summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-700 flex items-center gap-1"><MapPin className="w-4 h-4" /> Delivery Address</span>
                    <button onClick={() => setStep(1)} className="text-xs text-primary-700 hover:underline">Change</button>
                  </div>
                  <p className="text-sm text-gray-600">{address.fullName}, {address.phone}</p>
                  <p className="text-sm text-gray-500">{address.addressLine1}, {address.city}, {address.state} - {address.pincode}</p>
                </div>

                {/* Payment summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-700 flex items-center gap-1"><CreditCard className="w-4 h-4" /> Payment</span>
                    <button onClick={() => setStep(2)} className="text-xs text-primary-700 hover:underline">Change</button>
                  </div>
                  <p className="text-sm text-gray-600">{PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}</p>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm text-gray-600">
                      <span>{product.name} × {quantity}</span>
                      <span>{formatPrice(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1 justify-center">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={loading}
                    className="btn-primary flex-1 justify-center">
                    {loading ? 'Placing...' : `Place Order · ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-gray-600">
                    <span className="line-clamp-1 flex-1 mr-2">{product.name}</span>
                    <span className="shrink-0">{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                    {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span><span className="text-primary-700">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <Truck className="w-4 h-4" />
                <span>Estimated delivery: 2-4 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

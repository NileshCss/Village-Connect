'use client';

import { useState } from 'react';
import { Mail, Phone, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'Go to My Orders from your profile and click on any order to see real-time tracking. You will also receive SMS/email updates at each stage.',
  },
  {
    q: 'What is the return policy?',
    a: 'We accept returns within 24 hours of delivery for perishable items and within 7 days for non-perishable goods. Contact support with your order ID and reason.',
  },
  {
    q: 'How can I become a seller/farmer?',
    a: 'Register as a Farmer during sign-up. Our team will verify your details and onboard you within 2-3 business days.',
  },
  {
    q: 'Is there a minimum order value?',
    a: 'No minimum order! However, delivery charges of ₹49 apply for orders below ₹499. Orders above ₹499 enjoy free delivery.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept Cash on Delivery, UPI, Credit/Debit Cards, and Net Banking. All online payments are processed securely.',
  },
  {
    q: 'Are the products really organic?',
    a: 'Products marked "Organic" are certified by our verification team. Farmers must provide documentation. We do regular quality checks.',
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll reply within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
          <p className="text-gray-500 mt-2">We're here to help. Get in touch with us.</p>
        </div>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Phone, label: 'Call Us', val: '+91 12345 67890', sub: 'Mon–Sat, 9AM–6PM', color: 'bg-blue-50 text-blue-600' },
            { icon: Mail, label: 'Email Us', val: 'support@village-connect.com', sub: 'Reply within 24hrs', color: 'bg-green-50 text-green-600' },
            { icon: MessageSquare, label: 'Live Chat', val: 'Chat with us', sub: 'Instant support', color: 'bg-purple-50 text-purple-600' },
          ].map(({ icon: Icon, label, val, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{label}</h3>
              <p className="text-sm text-gray-700 font-medium">{val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FAQs */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-sm text-gray-800 pr-4">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-primary-600 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Send Us a Message</h2>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { f: 'name', label: 'Your Name', type: 'text', placeholder: 'Full name' },
                  { f: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                  { f: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?' },
                ].map(({ f, label, type, placeholder }) => (
                  <div key={f}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <input type={type} value={(form as any)[f]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
                      placeholder={placeholder} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                  <textarea value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue or question..."
                    rows={4} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

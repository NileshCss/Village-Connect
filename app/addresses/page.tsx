'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Edit2, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { Address } from '@/types/database';
import { STATES } from '@/lib/utils';

const emptyForm = {
  label: 'Home', full_name: '', phone: '', address_line1: '',
  address_line2: '', city: '', state: '', pincode: '', is_default: false
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editId) {
      // @ts-ignore
      const { error } = await supabase.from('addresses').update(form).eq('id', editId);
      if (!error) toast.success('Address updated!');
    } else {
      // @ts-ignore
      const { error } = await supabase.from('addresses').insert({ ...form, user_id: user.id });
      if (!error) toast.success('Address saved!');
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    toast.success('Address removed');
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const startEdit = (addr: Address) => {
    setForm({
      label: addr.label, full_name: addr.full_name, phone: addr.phone,
      address_line1: addr.address_line1, address_line2: addr.address_line2 || '',
      city: addr.city, state: addr.state, pincode: addr.pincode, is_default: addr.is_default
    });
    setEditId(addr.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Saved Addresses</h1>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="btn-primary text-sm py-2">
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>

        {/* Address form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-5">{editId ? 'Edit Address' : 'New Address'}</h2>

            {/* Label buttons */}
            <div className="flex gap-2 mb-5">
              {['Home', 'Work', 'Other'].map((l) => (
                <button key={l} type="button" onClick={() => update('label', l)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                    form.label === l ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'
                  }`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { f: 'full_name', label: 'Full Name', placeholder: 'Recipient name', span: 1 },
                { f: 'phone', label: 'Phone', placeholder: '+91 98765 43210', span: 1 },
                { f: 'address_line1', label: 'Address Line 1', placeholder: 'House/Flat, Street', span: 2 },
                { f: 'address_line2', label: 'Address Line 2 (Optional)', placeholder: 'Area, Landmark', span: 2 },
                { f: 'city', label: 'City', placeholder: 'City', span: 1 },
                { f: 'pincode', label: 'Pincode', placeholder: '560001', span: 1 },
              ].map(({ f, label, placeholder, span }) => (
                <div key={f} className={span === 2 ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input type="text" value={(form as any)[f]} onChange={(e) => update(f, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <select value={form.state} onChange={(e) => update('state', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500">
                  <option value="">Select State</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" id="default" checked={form.is_default}
                  onChange={(e) => update('is_default', e.target.checked)}
                  className="w-4 h-4 accent-primary-600" />
                <label htmlFor="default" className="text-sm text-gray-700">Set as default address</label>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                className="btn-outline flex-1 justify-center text-sm py-2.5">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex-1 justify-center text-sm py-2.5">
                {saving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        )}

        {/* Address list */}
        {addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="font-medium text-gray-600">No addresses saved yet</p>
            <p className="text-sm text-gray-400 mt-1">Add an address to speed up checkout</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={`bg-white rounded-2xl shadow-sm p-5 border-2 transition-all ${addr.is_default ? 'border-primary-200' : 'border-transparent'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">{addr.label}</span>
                    {addr.is_default && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium">
                        <Star className="w-3 h-3 fill-green-500" /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(addr)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-sm text-gray-800">{addr.full_name}</p>
                <p className="text-xs text-gray-500">{addr.phone}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

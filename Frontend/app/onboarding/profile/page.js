'use client';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Upload } from 'lucide-react';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const cuisines = ['Indian', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Mediterranean', 'American', 'Thai', 'French', 'Fusion', 'Continental', 'Other'];

export default function BusinessProfilePage() {
  const [form, setForm] = useState({
    name: '',
    branches: 1,
    cuisine: [],
    location: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    brandColor: '#f59e0b',
    dineIn: true,
    takeaway: false,
    delivery: false,
    hours: daysOfWeek.reduce((acc, d) => ({ ...acc, [d]: { open: true, from: '11:00', to: '23:00' } }), {}),
  });

  const toggleCuisine = (c) => {
    setForm(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(c) ? prev.cuisine.filter(x => x !== c) : [...prev.cuisine, c],
    }));
  };

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 3 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Tell us about your restaurant
        </h2>
        <p className="text-slate-400 leading-relaxed">
          This is what guests will see. Add your branding, contact details, and hours.
        </p>
      </div>

      {/* Logo Upload */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-300 mb-2">Restaurant Logo</p>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600 cursor-pointer hover:border-amber-500/50 hover:text-amber-500/50 transition-colors">
            <Upload size={20} />
            <span className="text-xs mt-1">Upload</span>
          </div>
          <p className="text-sm text-slate-500">PNG, JPG up to 5MB<br />Recommended: 200×200px</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Basic info */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">Restaurant Name *</label>
          <input className="input-base" placeholder="e.g. Spice Garden" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Number of Branches</label>
            <input className="input-base" type="number" min={1} value={form.branches} onChange={e => setForm({...form, branches: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Brand Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.brandColor} onChange={e => setForm({...form, brandColor: e.target.value})} className="w-10 h-10 rounded-xl border border-slate-700 cursor-pointer bg-slate-800 p-1" />
              <input className="input-base flex-1" value={form.brandColor} onChange={e => setForm({...form, brandColor: e.target.value})} placeholder="#f59e0b" />
            </div>
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Cuisine Type</label>
          <div className="flex flex-wrap gap-2">
            {cuisines.map(c => (
              <button key={c} onClick={() => toggleCuisine(c)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  form.cuisine.includes(c)
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">Address</label>
          <div className="relative mb-3">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-base pl-10" placeholder="Street address" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <input className="input-base" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-base pl-10" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-base pl-10" placeholder="hello@restaurant.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">Restaurant Description</label>
          <textarea className="input-base resize-none" rows={3} placeholder="What makes your restaurant special?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>

        {/* Service types */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Service Types</label>
          <div className="flex gap-3 flex-wrap">
            {[['dineIn', 'Dine-In'], ['takeaway', 'Takeaway'], ['delivery', 'Delivery']].map(([key, label]) => (
              <button key={key} onClick={() => setForm({...form, [key]: !form[key]})}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  form[key] ? 'bg-amber-500/15 text-amber-400 border-amber-500/35' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Operating Hours */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block flex items-center gap-2">
            <Clock size={15} className="text-amber-400" />
            Operating Hours
          </label>
          <div className="space-y-2">
            {daysOfWeek.map(day => (
              <div key={day} className="flex items-center gap-3 py-1.5">
                <span className="text-sm font-medium text-slate-300 w-10 flex-shrink-0">{day}</span>
                <button
                  onClick={() => setForm(prev => ({...prev, hours: {...prev.hours, [day]: {...prev.hours[day], open: !prev.hours[day].open}}}))}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.hours[day].open ? 'bg-amber-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.hours[day].open ? 'translate-x-5 left-0' : 'left-0.5'}`} />
                </button>
                {form.hours[day].open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={form.hours[day].from} onChange={e => setForm(prev => ({...prev, hours: {...prev.hours, [day]: {...prev.hours[day], from: e.target.value}}}))} className="input-base w-auto text-sm py-1.5 px-3" />
                    <span className="text-slate-600 text-sm">to</span>
                    <input type="time" value={form.hours[day].to} onChange={e => setForm(prev => ({...prev, hours: {...prev.hours, [day]: {...prev.hours[day], to: e.target.value}}}))} className="input-base w-auto text-sm py-1.5 px-3" />
                  </div>
                ) : (
                  <span className="text-slate-600 text-sm">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

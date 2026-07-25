'use client';
import { useState } from 'react';
import { Plus, Trash2, Tag, Clock, Leaf } from 'lucide-react';

const defaultCategories = [
  { id: 1, name: 'Starters', icon: '🥗' },
  { id: 2, name: 'Main Course', icon: '🍛' },
  { id: 3, name: 'Desserts', icon: '🍨' },
  { id: 4, name: 'Beverages', icon: '🥤' },
];

export default function MenuSetupPage() {
  const [categories, setCategories] = useState(defaultCategories);
  const [newCat, setNewCat] = useState('');
  const [settings, setSettings] = useState({ trackAvailability: true, allowCustomizations: true, trackPrepTime: true, allergenLabels: true, todaySpecial: true, vegBadge: true });

  const addCategory = () => {
    if (newCat.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCat.trim(), icon: '🍽️' }]);
      setNewCat('');
    }
  };

  const Toggle = ({ label, desc, k }) => (
    <label className="flex items-center justify-between py-3 border-b border-slate-800 cursor-pointer group">
      <div>
        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</p>
        <p className="text-xs text-slate-600">{desc}</p>
      </div>
      <div onClick={() => setSettings(s => ({...s, [k]: !s[k]}))}>
        <div className={`relative w-11 h-6 rounded-full transition-colors ${settings[k] ? 'bg-amber-500' : 'bg-slate-700'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[k] ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </label>
  );

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 5 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Menu categories and structure
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Set up your menu categories now. You can add items, prices, and photos from the Menu Management dashboard after publishing.
        </p>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-3">Menu Categories</p>
        <div className="space-y-2 mb-3">
          {categories.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-xl">{c.icon}</span>
              <span className="flex-1 text-sm font-medium text-slate-200">{c.name}</span>
              <span className="text-xs text-slate-600 px-2 py-0.5 rounded-lg bg-slate-700">Category {i + 1}</span>
              <button onClick={() => setCategories(categories.filter(x => x.id !== c.id))}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input-base flex-1" placeholder="New category name..." value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()} />
          <button onClick={addCategory}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 transition-colors flex items-center gap-1.5 text-sm">
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {/* Menu settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <p className="text-sm font-semibold text-slate-300 mb-1">Menu Behavior</p>
        <p className="text-xs text-slate-600 mb-4">Configure how your menu works for guests and staff</p>
        <div>
          <Toggle label="Live Availability States" desc="Show available / unavailable / coming-soon status per item" k="trackAvailability" />
          <Toggle label="Today's Special Section" desc="Feature special items at the top of the menu" k="todaySpecial" />
          <Toggle label="Customizations & Add-ons" desc="Allow guests to add notes or customize orders" k="allowCustomizations" />
          <Toggle label="Prep Time per Item" desc="Show estimated prep time to guests" k="trackPrepTime" />
          <Toggle label="Allergen Labels" desc="Show dietary flags like gluten, dairy, nuts" k="allergenLabels" />
          <Toggle label="Veg / Non-Veg Badge" desc="Show green dot for vegetarian items" k="vegBadge" />
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl bg-amber-500/8 border border-amber-500/15">
        <p className="text-sm text-amber-300 font-medium mb-1">After publishing →</p>
        <p className="text-xs text-slate-500">Head to Menu Management in your dashboard to add items, photos, prices, and availability states.</p>
      </div>
    </div>
  );
}

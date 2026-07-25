'use client';
import { useState } from 'react';
import { mockRestaurant } from '@/lib/mockData';
import { Button, Toggle } from '@/components/ui';
import toast from 'react-hot-toast';
import { Save, Store, Bell, Shield, Palette } from 'lucide-react';

const tabs = [{ id: 'profile', label: 'Restaurant Profile', icon: Store }, { id: 'branding', label: 'Branding', icon: Palette }, { id: 'notifications', label: 'Notifications', icon: Bell }, { id: 'security', label: 'Security', icon: Shield }];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: mockRestaurant.name, tagline: mockRestaurant.tagline, description: mockRestaurant.description, phone: mockRestaurant.contact.phone, email: mockRestaurant.contact.email, address: mockRestaurant.location.address, city: mockRestaurant.location.city, brandColor: mockRestaurant.brandColor });
  const [notifs, setNotifs] = useState({ orderNotifs: true, lowStock: true, reservations: true, dailySummary: true, emailReceipts: true });

  const save = () => toast.success('Settings saved!');

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${activeTab === t.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-5">
          <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Restaurant Name</label><input className="input-base" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Tagline</label><input className="input-base" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} /></div>
          <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Description</label><textarea className="input-base resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Phone</label><input className="input-base" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Email</label><input className="input-base" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          </div>
          <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Address</label><input className="input-base" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">City</label><input className="input-base" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.brandColor} onChange={e => setForm({...form, brandColor: e.target.value})}
                className="w-12 h-12 rounded-xl border border-slate-700 cursor-pointer bg-slate-800 p-1" />
              <input className="input-base flex-1" value={form.brandColor} onChange={e => setForm({...form, brandColor: e.target.value})} />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-slate-600">
            <p className="text-sm mb-1">Restaurant Logo</p>
            <p className="text-xs">Click to upload PNG/JPG · Max 5MB</p>
          </div>
          <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-slate-600">
            <p className="text-sm mb-1">Cover Image</p>
            <p className="text-xs">1200×400px recommended</p>
          </div>
          <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Preview</p>
            <div className="h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: form.brandColor }}>
              {form.name}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-0">
          {[['orderNotifs', 'New order notifications', 'Get notified when a new order comes in'], ['lowStock', 'Low stock alerts', 'Alert when inventory falls below threshold'], ['reservations', 'Reservation updates', 'Notify for new reservations and cancellations'], ['dailySummary', 'Daily summary email', 'End-of-day business summary'], ['emailReceipts', 'Email receipts to guests', 'Auto-send receipts after payment']].map(([k, label, desc]) => (
            <Toggle key={k} checked={notifs[k]} onChange={v => setNotifs(n => ({...n, [k]: v}))} label={label} description={desc} />
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Change Password</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-slate-300 mb-1 block">Current Password</label><input type="password" className="input-base" placeholder="••••••••" /></div>
              <div><label className="text-sm text-slate-300 mb-1 block">New Password</label><input type="password" className="input-base" placeholder="Min. 8 characters" /></div>
              <div><label className="text-sm text-slate-300 mb-1 block">Confirm New Password</label><input type="password" className="input-base" placeholder="Repeat new password" /></div>
              <Button variant="primary" size="sm" onClick={() => toast.success('Password updated!')}>Update Password</Button>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <h3 className="text-base font-bold text-rose-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-3">Permanently delete your restaurant and all its data.</p>
            <Button variant="danger" size="sm">Delete Restaurant</Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="md" onClick={save}>
          <Save size={15} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

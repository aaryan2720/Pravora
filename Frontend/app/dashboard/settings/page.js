'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Button, Toggle } from '@/components/ui';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, Store, Bell, Shield, Palette, QrCode, Upload, HelpCircle, Loader2 } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: Store },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'notifications', label: 'Operations & Taxes', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield }
];

export default function SettingsPage() {
  const { activeRestaurant, setActiveRestaurant } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    brandColor: '#f59e0b',
    taxRate: 10,
    serviceChargeRate: 5,
    qrBaseUrl: '',
    reservationsEnabled: true,
    queueEnabled: true,
    membershipEnabled: true,
    aiEnabled: true,
  });

  const fetchDetails = async () => {
    if (!activeRestaurant?._id) return;
    try {
      const res = await api.restaurant.getById(activeRestaurant._id);
      if (res.success && res.restaurant) {
        const r = res.restaurant;
        setForm({
          name: r.name || '',
          tagline: r.tagline || '',
          description: r.description || '',
          phone: r.contact?.phone || '',
          email: r.contact?.email || '',
          address: r.location?.address || '',
          city: r.location?.city || '',
          brandColor: r.brandColor || '#f59e0b',
          taxRate: r.settings?.taxRate ?? 10,
          serviceChargeRate: r.settings?.serviceChargeRate ?? 5,
          qrBaseUrl: r.settings?.qrBaseUrl || '',
          reservationsEnabled: r.settings?.reservationsEnabled ?? true,
          queueEnabled: r.settings?.queueEnabled ?? true,
          membershipEnabled: r.settings?.membershipEnabled ?? true,
          aiEnabled: r.settings?.aiEnabled ?? true,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load restaurant details from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [activeRestaurant]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    setLogoUploading(true);
    try {
      toast.loading('Uploading logo to Cloudinary...', { id: 'upload' });
      const res = await api.restaurant.uploadLogo(activeRestaurant._id, formData);
      if (res.success) {
        toast.success('Logo uploaded successfully! ✓', { id: 'upload' });
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.message || 'Logo upload failed.', { id: 'upload' });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('cover', file);
    setCoverUploading(true);
    try {
      toast.loading('Uploading banner image...', { id: 'upload' });
      const res = await api.restaurant.uploadCover(activeRestaurant._id, formData);
      if (res.success) {
        toast.success('Cover image uploaded successfully! ✓', { id: 'upload' });
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.message || 'Cover upload failed.', { id: 'upload' });
    } finally {
      setCoverUploading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        contact: {
          phone: form.phone,
          email: form.email,
        },
        location: {
          address: form.address,
          city: form.city,
        },
        brandColor: form.brandColor,
        settings: {
          taxRate: Number(form.taxRate),
          serviceChargeRate: Number(form.serviceChargeRate),
          qrBaseUrl: form.qrBaseUrl,
          reservationsEnabled: form.reservationsEnabled,
          queueEnabled: form.queueEnabled,
          membershipEnabled: form.membershipEnabled,
          aiEnabled: form.aiEnabled,
        }
      };

      toast.loading('Saving settings updates...', { id: 'save' });
      const res = await api.restaurant.update(activeRestaurant._id, payload);
      if (res.success) {
        toast.success('Settings synchronized successfully! ✓', { id: 'save' });
        setActiveRestaurant(res.restaurant);
        localStorage.setItem('restaurant', JSON.stringify(res.restaurant));
      }
    } catch (err) {
      toast.error(err.message || 'Save failed.', { id: 'save' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading restaurant settings profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto animate-fadeIn pb-16">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center cursor-pointer ${activeTab === t.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
            <t.icon size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tabs panels */}
      {activeTab === 'profile' && (
        <div className="space-y-5 animate-fadeIn">
          <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Restaurant Name *</label><input required className="input-base text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Tagline</label><input className="input-base text-sm" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} placeholder="e.g. Authentic Woodfired Pizzas" /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Description</label><textarea className="input-base text-sm resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Phone *</label><input required className="input-base text-sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Email *</label><input type="email" required className="input-base text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Address *</label><input required className="input-base text-sm" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">City *</label><input required className="input-base text-sm" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Accent / Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.brandColor} onChange={e => setForm({...form, brandColor: e.target.value})}
                className="w-12 h-12 rounded-xl border border-slate-700 cursor-pointer bg-slate-800 p-1" />
              <input className="input-base text-sm flex-1" value={form.brandColor} onChange={e => setForm({...form, brandColor: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Restaurant Logo</label>
              {activeRestaurant?.logo ? (
                <div className="mb-3 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-955/80 mx-auto flex items-center justify-center">
                  <img src={activeRestaurant.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="mb-3 w-20 h-20 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs mx-auto bg-slate-900/10">No Logo</div>
              )}
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center bg-slate-900/40 relative hover:border-slate-700 transition-colors">
                <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload size={18} className="text-slate-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-400">{logoUploading ? 'Uploading...' : 'Click to change Logo'}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Max 5MB</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Cover Banner Image</label>
              {activeRestaurant?.coverImage ? (
                <div className="mb-3 relative h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-955/80 flex items-center justify-center">
                  <img src={activeRestaurant.coverImage} alt="Banner" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="mb-3 h-20 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-650 text-xs bg-slate-900/10">No Banner</div>
              )}
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center bg-slate-900/40 relative hover:border-slate-700 transition-colors">
                <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={coverUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload size={18} className="text-slate-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-400">{coverUploading ? 'Uploading...' : 'Click to change Banner'}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">1200×400px recommended</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">ACCENT PREVIEW</p>
            <div className="h-14 rounded-xl flex items-center justify-center text-slate-950 font-bold transition-all shadow-sm" style={{ backgroundColor: form.brandColor }}>
              {form.name || 'Serving Good Food'}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tax controls */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-wider">Taxes & Fees Setup</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">GST Rate (%) *</label>
                <input type="number" min={0} max={30} className="input-base text-sm" value={form.taxRate} onChange={e => setForm({...form, taxRate: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Service Charge (%) *</label>
                <input type="number" min={0} max={20} className="input-base text-sm" value={form.serviceChargeRate} onChange={e => setForm({...form, serviceChargeRate: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Operational features */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Enable Features</p>
            <Toggle checked={form.reservationsEnabled} onChange={v => setForm({...form, reservationsEnabled: v})} label="Enable Reservations Module" description="Allow guests to book tables online" />
            <Toggle checked={form.queueEnabled} onChange={v => setForm({...form, queueEnabled: v})} label="Enable Waiting Queue Module" description="Track guest waitlists at front-of-house" />
            <Toggle checked={form.membershipEnabled} onChange={v => setForm({...form, membershipEnabled: v})} label="Enable Loyalty & Tiers" description="Track diner loyalty points (1 point per ₹10 spent)" />
            <Toggle checked={form.aiEnabled} onChange={v => setForm({...form, aiEnabled: v})} label="Gemini AI Auto-Pilot" description="Use AI recommendations for operational suggestions" />
          </div>
        </div>
      )}



      {activeTab === 'security' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-[11px]">Security Credentials</h3>
            <p className="text-xs text-slate-550 mb-3">Manage user account permissions under settings or request credentials reset.</p>
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-xs text-slate-400">
              User Role: <span className="font-bold text-amber-500 uppercase">{activeRestaurant?.owner === activeRestaurant?._id ? 'Owner' : 'Administrator'}</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-sm">
            <h3 className="text-sm font-bold text-rose-450 mb-2 uppercase tracking-wider text-[11px]">Danger Zone</h3>
            <p className="text-xs text-slate-500 mb-3">Permanently delete your restaurant profile. All digital menus, bookings, and customer databases will be wiped.</p>
            <Button variant="danger" size="sm">Request Account Deletion</Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="md" onClick={saveSettings} className="cursor-pointer gap-1.5">
          <Save size={15} />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

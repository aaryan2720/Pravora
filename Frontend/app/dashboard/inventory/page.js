'use client';
import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Trash2, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { ProgressBar, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const statusConfig = {
  ok: { label: 'OK', color: 'jade', text: 'text-emerald-400' },
  low: { label: 'Low', color: 'amber', text: 'text-amber-400' },
  critical: { label: 'Critical', color: 'rose', text: 'text-rose-400' },
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // single | bulk
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ name: '', unit: 'kg', current: 10, min: 5, max: 20, notes: '' });

  const fetchInventory = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.inventory.list();
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      await parseAndImportCSV(csvText);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      await parseAndImportCSV(csvText);
    };
    reader.readAsText(file);
  };

  const parseAndImportCSV = async (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      toast.error('The CSV file is empty or lacks data rows.');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.indexOf('name');
    const unitIndex = headers.indexOf('unit');
    const currentIndex = headers.indexOf('current');
    const minIndex = headers.indexOf('min');
    const maxIndex = headers.indexOf('max');
    const notesIndex = headers.indexOf('notes');

    if (nameIndex === -1 || unitIndex === -1) {
      toast.error('CSV must contain "Name" and "Unit" columns at a minimum.');
      return;
    }

    toast.loading('Importing inventory items...', { id: 'csv-import' });
    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(field => field.replace(/^["']|["']$/g, '').trim());
      const name = row[nameIndex];
      const unit = row[unitIndex] || 'kg';
      
      if (!name) {
        failCount++;
        continue;
      }

      const current = currentIndex !== -1 ? Number(row[currentIndex]) || 0 : 10;
      const min = minIndex !== -1 ? Number(row[minIndex]) || 5 : 5;
      const max = maxIndex !== -1 ? Number(row[maxIndex]) || 20 : 20;
      const notes = notesIndex !== -1 ? row[notesIndex] || '' : '';

      try {
        await api.inventory.create({ name, unit, current, min, max, notes });
        successCount++;
      } catch (err) {
        console.error('Failed to import CSV row:', name, err);
        failCount++;
      }
    }

    toast.dismiss('csv-import');
    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} inventory items! 🎉`);
      fetchInventory(false);
    }
    if (failCount > 0) {
      toast.error(`Failed to import ${failCount} rows. Please review format.`);
    }
  };

  const handleDownloadCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Unit,Current,Min,Max,Notes\nRice,kg,50,10,100,Basmati Stock\nMilk,liters,20,5,30,Organic Fresh Milk\nSalt,packets,8,2,15,Table Salt";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchInventory(true);
  }, []);

  const critical = items.filter(i => i.status === 'critical');
  const low = items.filter(i => i.status === 'low');

  const handleCreateItem = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.unit) return;
    try {
      const res = await api.inventory.create({
        name: form.name,
        unit: form.unit,
        current: Number(form.current),
        min: Number(form.min),
        max: Number(form.max),
        notes: form.notes
      });
      if (res.success) {
        toast.success(`Created stock item: ${res.item.name}`);
        setForm({ name: '', unit: 'kg', current: 10, min: 5, max: 20, notes: '' });
        setShowAddForm(false);
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create inventory item.');
    }
  };

  const handleUpdateStock = async (item, delta) => {
    const newCurrent = Math.max(0, item.current + delta);
    try {
      const res = await api.inventory.update(item._id, { current: newCurrent });
      if (res.success) {
        toast.success(`Updated stock for ${item.name}`);
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update stock.');
    }
  };

  const handleRestock = async (item) => {
    try {
      const res = await api.inventory.update(item._id, { current: item.max });
      if (res.success) {
        toast.success(`Restocked ${item.name} to maximum limit! 📦`);
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to restock item.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      const res = await api.inventory.delete(id);
      if (res.success) {
        toast.success('Removed inventory item');
        fetchInventory(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove inventory item.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading inventory list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto animate-fadeIn">
      {/* Alerts */}
      {critical.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 shadow-sm animate-fadeIn">
          <AlertTriangle size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">Critical Stock Alert</p>
            <p className="text-xs text-rose-400/70">{critical.map(i => i.name).join(', ')} — order immediately</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-400">{items.filter(i => i.status === 'ok').length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">In Stock</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-400">{low.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Running Low</p>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/8 border border-rose-500/20 text-center shadow-sm">
          <p className="text-2xl font-black text-rose-400">{critical.length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Critical</p>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kitchen Stock Manager</p>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5 cursor-pointer">
          <Plus size={14} /> Add Stock Item
        </Button>
      </div>

      {/* Form modal or panel */}
      {showAddForm && (
        <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm animate-fadeIn">
          {/* Tab Selection */}
          <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'single'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Single Item
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'bulk'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Bulk CSV Import
            </button>
          </div>

          {activeTab === 'single' ? (
            <form onSubmit={handleCreateItem}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Item Name *</label>
                  <input required className="input-base text-sm" placeholder="e.g. Cheese, Milk, Rice" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Unit *</label>
                  <input required className="input-base text-sm" placeholder="e.g. kg, L, boxes" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Stock</label>
                  <input type="number" required className="input-base text-sm" min={0} value={form.current} onChange={e => setForm({...form, current: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Min Threshold</label>
                    <input type="number" required className="input-base text-sm" min={0} value={form.min} onChange={e => setForm({...form, min: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Max Level</label>
                    <input type="number" required className="input-base text-sm" min={1} value={form.max} onChange={e => setForm({...form, max: e.target.value})} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Notes (optional)</label>
                <input className="input-base text-sm mb-4" placeholder="e.g. Keep refrigerated" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Create Item</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('csv-file-input').click()}
                className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  dragging 
                    ? 'border-amber-500 bg-amber-500/10' 
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <Package size={28} className={dragging ? 'text-amber-400 animate-bounce' : 'text-slate-500'} />
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-200">Drag & drop your CSV file here, or click to browse</p>
                  <p className="text-xs text-slate-500 mt-1">Expected columns: Name, Unit, Current, Min, Max, Notes</p>
                </div>
                <input 
                  id="csv-file-input" 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Info size={13} className="text-slate-400" /> Format example: <code>Name,Unit,Current,Min,Max,Notes</code></span>
                <button 
                  type="button" 
                  onClick={handleDownloadCSVTemplate}
                  className="text-amber-500 hover:text-amber-400 font-semibold cursor-pointer"
                >
                  Download CSV Template
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <Package size={15} className="text-amber-400" />
          <span className="text-sm font-semibold text-slate-300">Stock Levels</span>
        </div>
        <div className="divide-y divide-slate-800">
          {items.map(item => {
            const s = statusConfig[item.status || 'ok'];
            const pct = Math.min(100, (item.current / item.max) * 100);
            return (
              <div key={item._id || item.id} className="px-5 py-4 flex items-center gap-4 transition-colors hover:bg-slate-950/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-200">{item.name}</span>
                    <Badge variant={item.status === 'ok' ? 'jade' : item.status === 'low' ? 'amber' : 'rose'}>{s.label}</Badge>
                    {item.notes && (
                      <span className="text-slate-600 flex items-center gap-1 text-[11px]" title={item.notes}>
                        <Info size={11} /> {item.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={item.current} max={item.max} color={item.status === 'ok' ? 'jade' : item.status === 'low' ? 'amber' : 'rose'} className="flex-1" />
                    <span className="text-xs font-semibold text-slate-400 flex-shrink-0 w-28 text-right">
                      {item.current} / {item.max} {item.unit}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Min Alert Limit: {item.min} {item.unit}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleUpdateStock(item, -1)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-sm font-bold hover:bg-slate-700 transition-all cursor-pointer">−</button>
                    <button onClick={() => handleUpdateStock(item, 5)} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all cursor-pointer">+</button>
                  </div>
                  {item.status !== 'ok' && (
                    <button onClick={() => handleRestock(item)}
                      className="px-2 py-1.5 rounded-lg text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer">
                      Restock
                    </button>
                  )}
                  <button onClick={() => handleDeleteItem(item._id)} className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">
              No inventory stock items tracked. Add your first item above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

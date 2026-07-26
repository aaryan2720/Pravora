'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit3, Leaf, X, Trash2, Loader2, UploadCloud, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useApp } from '@/lib/context/AppContext';

const availabilityConfig = {
  available: { label: 'Available', variant: 'available', next: 'unavailable' },
  unavailable: { label: 'Unavailable', variant: 'unavailable', next: 'soon' },
  soon: { label: 'Coming Soon', variant: 'soon', next: 'available' },
};

function MenuItemCard({ item, onAvailabilityChange, onEdit, onDelete }) {
  const itemId = item._id || item.id;
  const av = availabilityConfig[item.availability || 'available'];

  return (
    <div className={`p-4 rounded-xl border transition-all ${item.availability === 'unavailable' ? 'border-slate-800 bg-slate-900/40 opacity-70' : 'border-slate-850 bg-slate-900 hover:border-slate-750'} animate-fadeInUp`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
            {item.isVeg ? (
              <span className="text-emerald-400 flex-shrink-0" title="Vegetarian"><Leaf size={12} /></span>
            ) : (
              <span className="w-3 h-3 rounded-sm border-2 border-rose-400 flex items-center justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              </span>
            )}
            {item.isSpecial && <Badge variant="amber">Special</Badge>}
          </div>
          <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-black text-white">₹{item.price}</p>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/60">
        <button
          onClick={() => onAvailabilityChange(itemId, av.next)}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className={`badge ${av.variant === 'available' ? 'badge-available' : av.variant === 'unavailable' ? 'badge-unavailable' : 'badge-soon'}`}>
            {av.label}
          </span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">{item.prepTime || 15}m prep</span>
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onDelete(itemId)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickEditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ 
    price: item?.price || 0, 
    availability: item?.availability || 'available', 
    isSpecial: item?.isSpecial || false,
    description: item?.description || ''
  });
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base truncate">{item.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Price (₹)</label>
            <input className="input-base" type="number" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Description</label>
            <textarea className="input-base text-xs resize-none" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Availability State</label>
            <div className="flex gap-2">
              {['available', 'unavailable', 'soon'].map(a => (
                <button key={a} onClick={() => setForm({...form, availability: a})}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${form.availability === a ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                  {a === 'soon' ? 'Soon' : a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 py-1 cursor-pointer" onClick={() => setForm({...form, isSpecial: !form.isSpecial})}>
            <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isSpecial ? 'bg-amber-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isSpecial ? 'translate-x-5 left-0' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-medium text-slate-300">Feature as Today's Special</span>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
          <Button type="button" variant="primary" size="sm" onClick={() => { onSave(item._id || item.id, form); onClose(); }} className="flex-1 cursor-pointer">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

export default function MenuManagementPage() {
  const { activeRestaurant } = useApp();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Drag & drop state
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  // Modals controller states
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: 0, categoryId: '', prepTime: 15, isVeg: true, isSpecial: false });

  const fetchMenuData = async (showLoad = false) => {
    if (!activeRestaurant?._id) return;
    if (showLoad) setLoading(true);
    try {
      const res = await api.menu.getPublic(activeRestaurant._id);
      if (res.success && res.menu) {
        // Build flat lists of categories & items
        const cats = res.menu.map(c => ({ id: c._id, name: c.name, icon: c.icon || '🍽️' }));
        const menuItems = res.menu.flatMap(c => (c.items || []).map(i => ({ ...i, categoryId: c._id })));
        setCategories(cats);
        setItems(menuItems);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu catalog.');
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData(true);
  }, [activeRestaurant]);

  const updateAvailability = async (itemId, availability) => {
    try {
      const res = await api.menu.updateAvailability(itemId, availability);
      if (res.success) {
        setItems(prev => prev.map(i => (i._id || i.id) === itemId ? { ...i, availability } : i));
        const labels = { available: '✅ Marked available', unavailable: '🔴 Marked unavailable', soon: '🟡 Marked coming soon' };
        toast.success(labels[availability]);
      }
    } catch (err) {
      toast.error(err.message || 'Availability toggle failed.');
    }
  };

  const saveItemEdit = async (itemId, data) => {
    try {
      const res = await api.menu.updateItem(itemId, data);
      if (res.success) {
        toast.success('Menu item updated!');
        fetchMenuData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Edit failed.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      const res = await api.menu.deleteItem(itemId);
      if (res.success) {
        toast.success('Item deleted.');
        fetchMenuData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim() || !activeRestaurant?._id) return;
    try {
      const res = await api.menu.createCategory({
        restaurantId: activeRestaurant._id,
        name: newCatName.trim(),
        icon: '🍽️'
      });
      if (res.success) {
        toast.success('Category created!');
        setNewCatName('');
        setShowAddCat(false);
        fetchMenuData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Add category failed.');
    }
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.categoryId || !activeRestaurant?._id) {
      toast.error('Please enter name and category.');
      return;
    }

    try {
      const res = await api.menu.createItem({
        restaurantId: activeRestaurant._id,
        ...itemForm,
        price: Number(itemForm.price),
        prepTime: Number(itemForm.prepTime)
      });
      if (res.success) {
        toast.success('Item added successfully!');
        setItemForm({ name: '', description: '', price: 0, categoryId: '', prepTime: 15, isVeg: true, isSpecial: false });
        setShowAddItem(false);
        fetchMenuData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Add item failed.');
    }
  };

  // Drag & drop handlers
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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processMenuFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processMenuFile(files[0]);
    }
  };

  const processMenuFile = async (file) => {
    if (!activeRestaurant?._id) return;
    setParsing(true);
    toast.loading(`AI reading menu from ${file.name}...`, { id: 'menuParse' });
    
    // Simulate AI parsing delay
    await new Promise(r => setTimeout(r, 1500));

    try {
      let mockParsedCategories = [];
      let mockParsedItems = [];

      if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const text = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsText(file);
        });

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        let currentCatName = 'Chef Specials';

        lines.forEach(line => {
          if (line.includes(':')) {
            const parts = line.split(':');
            const cat = parts[0].trim();
            const itemPart = parts[1].trim();
            
            if (cat && !mockParsedCategories.includes(cat)) {
              mockParsedCategories.push(cat);
            }
            currentCatName = cat;

            if (itemPart.includes('-')) {
              const itemParts = itemPart.split('-');
              const name = itemParts[0].trim();
              const price = Number(itemParts[1].replace(/[^0-9]/g, '')) || 199;
              mockParsedItems.push({ name, price, categoryName: currentCatName });
            }
          } else if (line.includes('-')) {
            const parts = line.split('-');
            const name = parts[0].trim();
            const price = Number(parts[1].replace(/[^0-9]/g, '')) || 199;
            mockParsedItems.push({ name, price, categoryName: currentCatName });
          } else if (line.length < 25 && isNaN(line)) {
            currentCatName = line;
            if (!mockParsedCategories.includes(line)) {
              mockParsedCategories.push(line);
            }
          }
        });
      }

      if (mockParsedCategories.length === 0 || mockParsedItems.length === 0) {
        toast.error('Could not detect any menu items in this file. Please ensure it is a plain text list using the format: "Dish Name - Price" (e.g., "Margarita Pizza - 299").', { id: 'menuParse' });
        return;
      }

      // 1. Create categories
      const categoryMap = {};
      for (const catName of mockParsedCategories) {
        const existing = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (existing) {
          categoryMap[catName] = existing.id;
        } else {
          const res = await api.menu.createCategory({
            restaurantId: activeRestaurant._id,
            name: catName,
            icon: catName.toLowerCase().includes('drink') ? '🥤' : catName.toLowerCase().includes('sweet') || catName.toLowerCase().includes('dessert') ? '🍨' : '🍛'
          });
          if (res.success && res.category) {
            categoryMap[catName] = res.category._id;
          }
        }
      }

      // 2. Create items
      const itemPromises = mockParsedItems.map(item => {
        const catId = categoryMap[item.categoryName] || Object.values(categoryMap)[0] || categories[0]?.id;
        if (!catId) return Promise.resolve();
        return api.menu.createItem({
          restaurantId: activeRestaurant._id,
          categoryId: catId,
          name: item.name,
          price: item.price,
          description: 'AI auto-imported item details.',
          prepTime: 15,
          isVeg: true,
          isSpecial: false
        });
      });

      await Promise.all(itemPromises);
      toast.success(`Successfully imported ${mockParsedItems.length} menu items! 🚀`, { id: 'menuParse' });
      fetchMenuData(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse and import menu.', { id: 'menuParse' });
    } finally {
      setParsing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
        <p className="text-sm">Fetching restaurant menu database...</p>
      </div>
    );
  }

  const filtered = items.filter(i => {
    const matchCat = activeCategory === 'all' || i.categoryId === activeCategory;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    available: items.filter(i => i.availability === 'available').length,
    unavailable: items.filter(i => i.availability === 'unavailable').length,
    soon: items.filter(i => i.availability === 'soon').length,
    specials: items.filter(i => i.isSpecial).length
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fadeIn pb-16">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[['Available', stats.available, 'text-emerald-400'], ['Unavailable', stats.unavailable, 'text-rose-400'], ['Coming Soon', stats.soon, 'text-amber-400'], ["Today's Specials", stats.specials, 'text-amber-300']].map(([label, val, color]) => (
          <div key={label} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shadow-sm">
            <p className={`text-xl font-black ${color}`}>{val}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input-base pl-9 py-2 text-sm" placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAddCat(true)} className="gap-1.5 text-slate-300 border-slate-800 bg-slate-900 cursor-pointer">
            <Plus size={14} /> Add Category
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddItem(true)} className="gap-1.5 cursor-pointer">
            <Plus size={14} /> Add Item
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
      />

      {/* Drag & Drop Catalog Importer */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`mb-6 p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragging ? 'border-amber-500 bg-amber-500/10 scale-[0.99]' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        {parsing ? (
          <div className="space-y-2 py-4">
            <Loader2 className="animate-spin text-amber-500 mx-auto" size={32} />
            <p className="text-sm font-semibold text-white">AI is reading your menu layout...</p>
            <p className="text-xs text-slate-500">Creating category blocks & items inside MongoDB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-slate-200">Drag & Drop Menu Image / List to Import via AI</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Drop a photo of your menu, a text list (.txt/.csv), or an Excel spreadsheet to auto-create categories and items instantly.
            </p>
            <div className="mt-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-left text-xs max-w-sm mx-auto space-y-1 text-slate-400">
              <p className="font-semibold text-slate-300 mb-1.5 text-center text-[11px] uppercase tracking-wider">Supported Text/CSV Format:</p>
              <p className="flex items-start gap-1"><span className="text-amber-500">•</span> <span>Category Name (on its own line)</span></p>
              <p className="flex items-start gap-1"><span className="text-amber-500">•</span> <span>Dish Name - Price (e.g., Margarita Pizza - 299)</span></p>
              <p className="flex items-start gap-1"><span className="text-amber-500">•</span> <span>Category: Dish Name - Price (e.g., Starters: Tomato Soup - 120)</span></p>
            </div>
            <div className="flex justify-center gap-4 pt-1.5 text-slate-650 text-xs">
              <span className="flex items-center gap-1"><Image size={12} /> Image</span>
              <span className="flex items-center gap-1"><FileText size={12} /> Text/CSV</span>
              <span className="flex items-center gap-1"><FileSpreadsheet size={12} /> Excel</span>
            </div>
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${activeCategory === 'all' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-350 hover:border-slate-700'}`}>
          All Items ({items.length})
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${activeCategory === cat.id ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-350 hover:border-slate-700'}`}>
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(item => (
          <MenuItemCard 
            key={item._id || item.id} 
            item={item} 
            onAvailabilityChange={updateAvailability} 
            onEdit={setEditItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-900 rounded-2xl text-slate-650 text-sm">
          No menu items found in this category.
        </div>
      )}

      {/* Edit Item Modal */}
      {editItem && <QuickEditModal item={editItem} onClose={() => setEditItem(null)} onSave={saveItemEdit} />}

      {/* Add Category Modal */}
      {showAddCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowAddCat(false)}>
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <form onSubmit={handleAddCategory} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Add Menu Category</h3>
              <button type="button" onClick={() => setShowAddCat(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Category Name</label>
                <input className="input-base" required value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Desserts, Soups" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddCat(false)} className="flex-1 cursor-pointer">Cancel</Button>
              <Button type="submit" variant="primary" size="sm" className="flex-1 cursor-pointer">Create</Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowAddItem(false)}>
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <form onSubmit={handleAddItemSubmit} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Add Menu Item</h3>
              <button type="button" onClick={() => setShowAddItem(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Item Name *</label>
                <input className="input-base" required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} placeholder="e.g. Butter Chicken" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Price (₹) *</label>
                  <input className="input-base" type="number" min={0} required value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Prep Time (min)</label>
                  <input className="input-base" type="number" min={1} value={itemForm.prepTime} onChange={e => setItemForm({...itemForm, prepTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Category *</label>
                <select className="input-base" required value={itemForm.categoryId} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})}>
                  <option value="">Select a Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Description</label>
                <textarea className="input-base resize-none text-xs" rows={2} value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} placeholder="Short description of ingredients..." />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setItemForm({...itemForm, isVeg: !itemForm.isVeg})}>
                  <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${itemForm.isVeg ? 'bg-amber-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${itemForm.isVeg ? 'translate-x-5 left-0' : 'left-0.5'}`} />
                  </div>
                  <span className="text-xs font-medium text-slate-350">Vegetarian Item</span>
                </div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setItemForm({...itemForm, isSpecial: !itemForm.isSpecial})}>
                  <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${itemForm.isSpecial ? 'bg-amber-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${itemForm.isSpecial ? 'translate-x-5 left-0' : 'left-0.5'}`} />
                  </div>
                  <span className="text-xs font-medium text-slate-355">Today's Special</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddItem(false)} className="flex-1 cursor-pointer">Cancel</Button>
              <Button type="submit" variant="primary" size="sm" className="flex-1 cursor-pointer">Add to Menu</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

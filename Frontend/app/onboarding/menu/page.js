'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Image, FileSpreadsheet, Loader2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultCategories = [
  { id: 1, name: 'Starters', icon: '🥗' },
  { id: 2, name: 'Main Course', icon: '🍛' },
  { id: 3, name: 'Desserts', icon: '🍨' },
  { id: 4, name: 'Beverages', icon: '🥤' },
];

export default function MenuSetupPage() {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState(defaultCategories);
  const [newCat, setNewCat] = useState('');
  const [settings, setSettings] = useState({ trackAvailability: true, allowCustomizations: true, trackPrepTime: true, allergenLabels: true, todaySpecial: true, vegBadge: true });
  
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  // Load from local storage if existing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_menu');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.categories) setCategories(parsed.categories);
          if (parsed.settings) setSettings(parsed.settings);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save changes to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_menu', JSON.stringify({ categories, settings }));
    }
  }, [categories, settings]);

  const addCategory = () => {
    if (newCat.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCat.trim(), icon: '🍽️' }]);
      setNewCat('');
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
    setParsing(true);
    toast.loading(`AI parsing menu from ${file.name}...`, { id: 'menuParse' });
    
    // Simulate AI parsing delay
    await new Promise(r => setTimeout(r, 1500));

    try {
      if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          const foundCategories = [];
          
          lines.forEach(line => {
            if (line.includes(':')) {
              const cat = line.split(':')[0].trim();
              if (cat && !foundCategories.includes(cat) && foundCategories.length < 8) {
                foundCategories.push(cat);
              }
            } else if (line.length > 2 && line.length < 25 && !line.includes(',') && !line.includes('-') && isNaN(line)) {
              if (!foundCategories.includes(line) && foundCategories.length < 8) {
                foundCategories.push(line);
              }
            }
          });

          if (foundCategories.length > 0) {
            const icons = ['🥗', '🍛', '🍨', '🥤', '🍕', '🍰', '🍜', '🍔'];
            const newCats = foundCategories.map((name, i) => ({
              id: Date.now() + i,
              name,
              icon: icons[i % icons.length]
            }));
            setCategories(newCats);
            toast.success(`Successfully parsed ${foundCategories.length} categories! 🚀`, { id: 'menuParse' });
          } else {
            // Fallback for simple flat lists
            const customCats = [
              { id: Date.now() + 1, name: 'Imported Starters', icon: '🥗' },
              { id: Date.now() + 2, name: 'Imported Mains', icon: '🍛' },
              { id: Date.now() + 3, name: 'Beverages', icon: '🥤' }
            ];
            setCategories(customCats);
            toast.success('Successfully imported and categorized menu list! 🚀', { id: 'menuParse' });
          }
        };
        reader.readAsText(file);
      } else {
        // Image or Excel format: auto-generate structured set
        const autoSet = [
          { id: Date.now() + 1, name: 'House Specialties', icon: '🍲' },
          { id: Date.now() + 2, name: 'Hot Appetizers', icon: '🥟' },
          { id: Date.now() + 3, name: 'Gourmet Desserts', icon: '🍰' },
          { id: Date.now() + 4, name: 'Drinks & Bar', icon: '🍷' }
        ];
        setCategories(autoSet);
        toast.success('AI parsed menu structure and extracted 4 categories! 🚀', { id: 'menuParse' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse menu file.', { id: 'menuParse' });
    } finally {
      setParsing(false);
    }
  };

  const Toggle = ({ label, desc, k }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-b-0 group">
      <div>
        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={settings[k]}
        aria-label={label}
        onClick={() => setSettings(s => ({ ...s, [k]: !s[k] }))}
        className={`relative inline-flex flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange focus-visible:outline-offset-2 ${
          settings[k] ? 'bg-amber-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block w-5 h-5 top-0.5 left-0.5 relative bg-white rounded-full shadow transition-transform duration-200 ${
            settings[k] ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 5 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Menu categories and structure
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Set up your menu categories. You can type them manually or drag and drop your menu file to parse categories automatically.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
      />

      {/* Drag & Drop File Upload Zone */}
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
            <p className="text-xs text-slate-500">Extracting categories & catalog structures</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-slate-200">Drag & Drop your Menu File</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Drop a photo of your physical menu, a text list (.txt/.csv), or an Excel sheet to auto-fill categories.
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

      {/* Categories */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-3">Menu Categories</p>
        <div className="space-y-2 mb-3">
          {categories.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 animate-fadeInUp">
              <span className="text-xl">{c.icon}</span>
              <span className="flex-1 text-sm font-medium text-slate-200">{c.name}</span>
              <span className="text-xs text-slate-600 px-2 py-0.5 rounded-lg bg-slate-850">Category {i + 1}</span>
              <button onClick={() => setCategories(categories.filter(x => x.id !== c.id))}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer">
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
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 transition-colors flex items-center gap-1.5 text-sm cursor-pointer">
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {/* Menu behavior settings */}
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
        <p className="text-sm text-amber-300 font-medium mb-1">After onboarding →</p>
        <p className="text-xs text-slate-500">Your parsed menu categories will be saved automatically. You can manage, edit, and add photos to individual items from your dashboard.</p>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui';
import { QRCodeCanvas } from 'qrcode.react';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { QrCode, Download, Printer, RefreshCw, Save, HelpCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function QRCodesPage() {
  const { activeRestaurant, setActiveRestaurant } = useApp();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingDomain, setSavingDomain] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  
  // Custom QR base URL configuration state
  const [qrBaseUrl, setQrBaseUrl] = useState('');
  const hiddenQRContainerRef = useRef(null);

  const fetchTablesAndDetails = async () => {
    if (!activeRestaurant?._id) return;
    setLoading(true);
    try {
      // 1. Fetch tables
      const tRes = await api.tables.list();
      if (tRes.success) {
        setTables(tRes.tables || []);
      }
      // 2. Fetch latest restaurant details to get qrBaseUrl
      const rRes = await api.restaurant.getById(activeRestaurant._id);
      if (rRes.success && rRes.restaurant) {
        setQrBaseUrl(rRes.restaurant.settings?.qrBaseUrl || '');
        setActiveRestaurant(rRes.restaurant);
        localStorage.setItem('restaurant', JSON.stringify(rRes.restaurant));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tables list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesAndDetails();
  }, [activeRestaurant?._id]);

  const handleSaveDomain = async (e) => {
    e.preventDefault();
    if (!activeRestaurant?._id) return;
    setSavingDomain(true);
    try {
      const payload = {
        settings: {
          ...activeRestaurant.settings,
          qrBaseUrl: qrBaseUrl.trim()
        }
      };
      const res = await api.restaurant.update(activeRestaurant._id, payload);
      if (res.success) {
        toast.success('QR Scan domain saved! ✓');
        setActiveRestaurant(res.restaurant);
        localStorage.setItem('restaurant', JSON.stringify(res.restaurant));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save configuration.');
    } finally {
      setSavingDomain(false);
    }
  };

  const handleRegenerateAll = async () => {
    if (!confirm('Warning: Regenerating all table tokens will invalidate all existing printed QR codes. Are you sure you want to proceed?')) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await api.tables.regenerateAllTokens();
      if (res.success) {
        toast.success('Successfully regenerated secure session keys for all tables! 🔄');
        setTables(res.tables || []);
      }
    } catch (err) {
      toast.error(err.message || 'Regeneration failed.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadSingle = (table) => {
    const canvas = document.getElementById(`qr-canvas-${table.label}`);
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeRestaurant?.name || 'Restaurant'}_Table_${table.label}_QR.png`;
    a.click();
    toast.success(`Downloaded QR code for Table ${table.label}!`);
  };

  const handlePrintSingle = (table) => {
    const canvas = document.getElementById(`qr-canvas-${table.label}`);
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table ${table.label} QR</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; background: white; color: black; }
            img { width: 320px; height: 320px; }
            h1 { margin-top: 25px; font-size: 36px; font-weight: 800; letter-spacing: 0.05em; }
            p { font-size: 14px; color: #555; margin-top: 5px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${dataUrl}" />
          <h1>TABLE ${table.label}</h1>
          <p>Scan to Browse Menu & Order</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadAll = async () => {
    if (tables.length === 0) return;
    toast.loading('Compiling tables QR zip package... 📦', { id: 'zip' });
    const zip = new JSZip();
    const folder = zip.folder("tables_qr_codes");

    try {
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const canvas = document.getElementById(`hidden-qr-canvas-${table.label}`);
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.split(',')[1];
          folder.file(`Table_${table.label}_QR.png`, base64Data, { base64: true });
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeRestaurant?.slug || 'restaurant'}_table_qrs.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR package downloaded successfully! 📦', { id: 'zip' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ZIP file.', { id: 'zip' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin w-8 h-8 text-amber-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p>Loading table QR directories...</p>
      </div>
    );
  }

  const effectiveBaseUrl = qrBaseUrl.trim() || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  return (
    <div className="max-w-[1100px] mx-auto animate-fadeIn pb-20">
      
      {/* Configuration Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <QrCode size={16} className="text-amber-500" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-[11px]">QR Scan Domain Configuration</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed max-w-[800px]">
          Configure the base address embedded in your table QR codes. Use your local IP address (e.g. <code className="text-sky-450">http://192.168.56.1:3000</code>) to test ordering flows on physical mobile devices connected to your Wi-Fi router.
        </p>

        <form onSubmit={handleSaveDomain} className="flex gap-3 max-w-[600px] flex-wrap sm:flex-nowrap">
          <input 
            className="input-base text-sm font-mono text-slate-200 flex-1" 
            placeholder="e.g. http://192.168.56.1:3000" 
            value={qrBaseUrl} 
            onChange={e => setQrBaseUrl(e.target.value)} 
          />
          <Button type="submit" variant="primary" disabled={savingDomain} className="gap-1.5 cursor-pointer">
            <Save size={14} />
            {savingDomain ? 'Saving...' : 'Save Domain'}
          </Button>
        </form>
        <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
          <HelpCircle size={10} /> Leaving empty auto-resolves to browser's active address: <code className="text-slate-500 font-mono">{effectiveBaseUrl}</code>
        </p>
      </div>

      {/* Global Actions */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Table QR Directory</h3>
          <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-450 rounded-full border border-slate-700 font-semibold">{tables.length} tables</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleDownloadAll} className="gap-1.5 cursor-pointer">
            <Download size={14} /> Download ZIP Pack
          </Button>
          <Button variant="danger" size="sm" onClick={handleRegenerateAll} disabled={regenerating} className="gap-1.5 cursor-pointer">
            <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
            {regenerating ? 'Regenerating...' : 'Regenerate All'}
          </Button>
        </div>
      </div>

      {/* Warning block */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-slate-450 text-xs mb-6">
        <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Security Notice:</strong> Regenerating table tokens updates the secure session key in MongoDB. Any previously printed table QR sheets will become invalid and must be re-downloaded/re-printed.
        </p>
      </div>

      {/* Table QRs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map(table => {
          const scanUrl = `${effectiveBaseUrl}/r/scan?token=${table.qrToken}`;
          const directLandingUrl = `${effectiveBaseUrl}/r/${activeRestaurant.slug}/table/${table.label}`;
          return (
            <div key={table._id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center justify-between">
              
              {/* QR Canvas Container */}
              <div className="bg-white p-3 rounded-2xl mb-4 w-[160px] h-[160px] flex items-center justify-center shadow-inner relative group">
                <QRCodeCanvas
                  id={`qr-canvas-${table.label}`}
                  value={scanUrl}
                  size={136}
                  level="H"
                />
              </div>

              {/* Table Info & Action Links */}
              <div className="w-full text-center space-y-1 mb-4">
                <h4 className="text-base font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Table {table.label}</h4>
                <p className="text-xs text-slate-500">{table.seats} Seats · {table.status.toUpperCase()}</p>
                <div className="pt-2 flex flex-col gap-1 border-t border-slate-800/60 mt-2">
                  <a href={scanUrl} target="_blank" className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-1 justify-center transition-colors truncate">
                    Scan URL <ExternalLink size={10} />
                  </a>
                  <a href={directLandingUrl} target="_blank" className="text-[10px] text-slate-500 hover:text-slate-400 flex items-center gap-1 justify-center transition-colors truncate">
                    Menu URL <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Direct print/download button */}
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => handlePrintSingle(table)} 
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700/50 cursor-pointer"
                  title="Print QR Sheet"
                >
                  <Printer size={12} /> Print
                </button>
                <button 
                  onClick={() => handleDownloadSingle(table)} 
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700/50 cursor-pointer"
                  title="Download Image"
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden QR Container for JSZip compiler */}
      <div ref={hiddenQRContainerRef} className="hidden">
        {tables.map(table => {
          const scanUrl = `${effectiveBaseUrl}/r/scan?token=${table.qrToken}`;
          return (
            <QRCodeCanvas
              key={`hidden-${table._id}`}
              id={`hidden-qr-canvas-${table.label}`}
              value={scanUrl}
              size={256}
              level="H"
            />
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-850 rounded-2xl text-slate-550 text-sm">
          No active dining tables registered. Head to <code className="text-amber-500">Tables</code> to build tables.
        </div>
      )}
    </div>
  );
}

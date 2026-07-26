'use client';
import { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, Download, X, Printer, CheckCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import JSZip from 'jszip';

export default function TablesSetupPage() {
  const [config, setConfig] = useState({ tableCount: 16, namingScheme: 'T', fixedQR: true, qrOpens: 'menu_and_order' });
  const [tablesList, setTablesList] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const hiddenQRContainerRef = useRef(null);

  // Load initial settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_tables');
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Generate / Regenerate table codes on count or scheme changes
  useEffect(() => {
    const list = Array.from({ length: config.tableCount }, (_, i) => {
      const label = `${config.namingScheme}${i + 1}`;
      // Generate a mock secure token matching the structure expected by resolveQRToken
      const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return {
        label,
        token: `tbl-token-${label.toLowerCase()}-${randomPart}`
      };
    });
    setTablesList(list);
    
    // Save to local storage for Step 11 mapping
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_tables', JSON.stringify(config));
    }
  }, [config.tableCount, config.namingScheme]);

  const handleRegenerate = () => {
    const list = Array.from({ length: config.tableCount }, (_, i) => {
      const label = `${config.namingScheme}${i + 1}`;
      const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return {
        label,
        token: `tbl-token-${label.toLowerCase()}-${randomPart}`
      };
    });
    setTablesList(list);
    toast.success('🔄 Regenerated secure tokens for all table QRs!');
  };

  // Helper to trigger direct browser download of canvas data url
  const downloadQRFile = (canvas, filename) => {
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSingle = (table) => {
    const canvas = document.getElementById(`qr-canvas-${table.label}`);
    if (canvas) {
      downloadQRFile(canvas, `Table_${table.label}_QR.png`);
      toast.success(`Downloaded Table ${table.label} QR!`);
    } else {
      toast.error('Unable to fetch QR canvas.');
    }
  };

  const handleDownloadAll = async () => {
    if (tablesList.length === 0) return;
    
    toast.loading('Generating tables QR zip pack... 📦', { id: 'downloadAll' });
    const zip = new JSZip();
    const folder = zip.folder("tables_qr_codes");
    
    try {
      for (let i = 0; i < tablesList.length; i++) {
        const table = tablesList[i];
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
      a.download = `${config.namingScheme || 'Table'}_QR_Codes.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Successfully downloaded QR zip pack! 📦', { id: 'downloadAll' });
    } catch (err) {
      console.error('Error generating QR zip:', err);
      toast.error('Failed to create ZIP package.', { id: 'downloadAll' });
    }
  };

  const handlePrintQR = (table) => {
    const canvas = document.getElementById(`qr-canvas-${table.label}`);
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - Table ${table.label}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { border: 2px solid #ccc; padding: 30px; border-radius: 20px; text-align: center; max-width: 300px; }
            img { width: 200px; height: 200px; margin-bottom: 15px; }
            h1 { margin: 0; font-size: 24px; color: #111; }
            p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="card">
            <img src="${dataUrl}" />
            <h1>Table ${table.label}</h1>
            <p>Scan to Browse Menu & Order</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Limit displaying to first 12 in the preview grid for layouts
  const displayTables = tablesList.slice(0, 12);

  return (
    <div className="animate-fadeInUp relative">
      <div className="mb-8">
        <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wide">Step 10 of 11</p>
        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Tables and QR setup</h2>
        <p className="text-slate-400 leading-relaxed">
          Each table gets a unique QR code that starts a tracked guest session. Click on any table below to preview, print, or download its QR code.
        </p>
      </div>

      <div className="flex flex-col gap-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Number of Tables</label>
            <input className="input-base" type="number" min={1} max={100} value={config.tableCount}
              onChange={e => setConfig(c => ({...c, tableCount: Math.min(100, Math.max(1, +e.target.value))}))} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Table Name Prefix</label>
            <input className="input-base" placeholder="T" value={config.namingScheme}
              onChange={e => setConfig(c => ({...c, namingScheme: e.target.value.toUpperCase().trim()}))} />
            <p className="text-xs text-slate-600 mt-1">e.g. "T" → T1, T2, T3</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">When guest scans QR, open:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[['menu_only', 'Menu Only', 'Browse menu without ordering'], ['order_only', 'Order Directly', 'Jump straight to order flow'], ['menu_and_order', 'Menu + Order', 'Browse then order (recommended)']].map(([v, label, desc]) => (
              <button key={v} onClick={() => setConfig(c => ({...c, qrOpens: v}))}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${config.qrOpens === v ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}>
                <p className={`text-sm font-semibold ${config.qrOpens === v ? 'text-amber-400' : 'text-slate-300'}`}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                {v === 'menu_and_order' && <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-amber-500 text-slate-900 rounded-full font-bold">RECOMMENDED</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QR preview grid */}
      <div>
        <p className="text-sm font-semibold text-slate-300 mb-3">Table QR Preview (Click to select)</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
          {displayTables.map(t => (
            <div
              key={t.label}
              onClick={() => setSelectedTable(t)}
              className={`aspect-square rounded-xl bg-slate-900 border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${selectedTable?.label === t.label ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-slate-800 hover:border-slate-700'}`}
            >
              <QRCodeCanvas
                id={`hidden-qr-canvas-${t.label}`}
                value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/r/scan?token=${t.token}`}
                size={128}
                level="M"
                style={{ display: 'none' }}
              />
              <QrCode size={22} className={selectedTable?.label === t.label ? 'text-amber-400' : 'text-slate-500'} />
              <span className={`text-xs font-bold ${selectedTable?.label === t.label ? 'text-amber-400' : 'text-slate-400'}`}>{t.label}</span>
            </div>
          ))}
          {config.tableCount > 12 && (
            <div className="aspect-square rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-600">
              +{config.tableCount - 12} more
            </div>
          )}
        </div>
        
        {/* Hidden Container containing ALL table canvases for batch download triggers */}
        <div ref={hiddenQRContainerRef} className="hidden">
          {tablesList.map(t => (
            <QRCodeCanvas
              key={`hidden-${t.label}`}
              id={`hidden-qr-canvas-${t.label}`}
              value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/r/scan?token=${t.token}`}
              size={256}
              level="H"
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={handleDownloadAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all cursor-pointer">
            <Download size={14} />
            Download all QR codes
          </button>
          <button onClick={handleRegenerate} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all cursor-pointer">
            <RefreshCw size={14} />
            Regenerate all
          </button>
        </div>
      </div>

      {/* Selected Table Preview Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 relative">
            <button
              onClick={() => setSelectedTable(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Table {selectedTable.label} QR Code
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Scan to access table ordering flow</p>
              </div>

              {/* Render large live scannable canvas */}
              <div className="w-48 h-48 bg-white p-3.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <QRCodeCanvas
                  id={`qr-canvas-${selectedTable.label}`}
                  value={`${window.location.origin}/r/scan?token=${selectedTable.token}`}
                  size={168}
                  level="H"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-left">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Target Action</p>
                <p className="text-xs font-mono text-amber-500/80 truncate">
                  {window.location.origin}/r/scan?token={selectedTable.token.substring(0, 15)}...
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDownloadSingle(selectedTable)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-xs font-bold rounded-xl transition-all cursor-pointer text-slate-200"
                >
                  <Download size={14} />
                  Download PNG
                </button>
                <button
                  onClick={() => handlePrintQR(selectedTable)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Printer size={14} />
                  Print Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

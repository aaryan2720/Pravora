'use client';

// Button Component
export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, onClick, type = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  const variants = {
    primary: 'bg-amber-500 text-slate-900 hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98]',
    secondary: 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 active:scale-[0.98]',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100 active:scale-[0.98]',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 active:scale-[0.98]',
    success: 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98]',
    outline: 'bg-transparent text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-500 active:scale-[0.98]',
    glass: 'bg-white/5 backdrop-blur-sm text-slate-100 border border-white/10 hover:bg-white/10 active:scale-[0.98]',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Badge Component
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    available: 'badge-available',
    unavailable: 'badge-unavailable',
    soon: 'badge-soon',
    special: 'badge-special',
    veg: 'badge-veg',
    nonveg: 'badge-nonveg',
    gold: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    silver: 'bg-slate-400/20 text-slate-300 border border-slate-400/30',
    platinum: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    jade: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    sky: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    violet: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  };
  return (
    <span className={`badge ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

// Card Component
export function Card({ children, className = '', hover = false, glass = false, onClick, ...props }) {
  const base = 'rounded-2xl border border-slate-800 bg-slate-900';
  const glassStyle = glass ? 'glass' : '';
  const hoverStyle = hover ? 'card-hover cursor-pointer' : '';
  return (
    <div
      onClick={onClick}
      className={`${base} ${glassStyle} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Input Component
export function Input({ label, error, className = '', icon, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
        <input
          className={`input-base ${icon ? 'pl-10' : ''} ${error ? 'border-rose-500/50 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}

// Select Component
export function Select({ label, options = [], error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <select
        className={`input-base ${error ? 'border-rose-500/50' : ''} ${className}`}
        style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}

// Textarea Component
export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        className={`input-base resize-none ${error ? 'border-rose-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}

// Spinner Component
export function Spinner({ size = 20, color = '#f59e0b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// StatusDot Component
export function StatusDot({ status = 'live', label }) {
  const statusMap = { live: 'live', busy: 'busy', offline: 'offline', error: 'error' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`status-dot ${statusMap[status] || 'offline'}`} />
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
    </span>
  );
}

// Avatar Component
export function Avatar({ name, size = 36, src, className = '' }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['#f59e0b', '#10b981', '#8b5cf6', '#0ea5e9', '#f43f5e'];
  const colorIndex = name?.charCodeAt(0) % colors.length || 0;
  if (src) {
    return <img src={src} alt={name} className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-slate-900 flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: colors[colorIndex], fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

// Toggle Component
export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0" onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-amber-500' : 'bg-slate-700'}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</p>}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      )}
    </label>
  );
}

// Progress Bar Component
export function ProgressBar({ value, max = 100, color = 'amber', className = '', showLabel = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = { amber: 'bg-amber-500', jade: 'bg-emerald-500', sky: 'bg-sky-500', rose: 'bg-rose-500', violet: 'bg-violet-500' };
  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color] || 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="text-xs text-slate-500 mt-1">{pct.toFixed(0)}%</p>}
    </div>
  );
}

// Divider Component
export function Divider({ label, className = '' }) {
  if (!label) return <hr className={`border-slate-800 ${className}`} />;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <hr className="flex-1 border-slate-800" />
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <hr className="flex-1 border-slate-800" />
    </div>
  );
}

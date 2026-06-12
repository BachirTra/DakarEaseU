// Shared UI Components for Dakar'ease

const { useState, useEffect, useRef, useCallback } = React;

// ── Animated page transitions ──
function PageTransition({ children, screenKey, direction }) {
  const [display, setDisplay] = useState({ current: children, prev: null, animating: false, dir: 'right' });
  const prevKey = useRef(screenKey);

  useEffect(() => {
    if (prevKey.current !== screenKey) {
      setDisplay({ current: children, prev: display.current, animating: true, dir: direction || 'right' });
      prevKey.current = screenKey;
      setTimeout(() => setDisplay(d => ({ ...d, prev: null, animating: false })), 350);
    } else {
      setDisplay(d => ({ ...d, current: children }));
    }
  }, [screenKey, children]);

  const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', willChange: 'transform, opacity' };
  const enter = display.dir === 'right' ? 'translateX(30%)' : 'translateX(-30%)';
  const exit = display.dir === 'right' ? 'translateX(-30%)' : 'translateX(30%)';

  if (!display.animating) return <div style={{ ...base, position: 'relative' }}>{display.current}</div>;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ ...base, animation: `slideOut 350ms ease forwards` }}>
        <style>{`
          @keyframes slideOut { from { transform: translateX(0); opacity:1; } to { transform: ${exit}; opacity:0; } }
          @keyframes slideIn { from { transform: ${enter}; opacity:0; } to { transform: translateX(0); opacity:1; } }
        `}</style>
        {display.prev}
      </div>
      <div style={{ ...base, animation: `slideIn 350ms ease forwards` }}>{display.current}</div>
    </div>
  );
}

// ── Bottom Tab Bar ──
function BottomTabBar({ active, onNavigate }) {
  const tabs = [
    { id: 'home', label: 'Accueil', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
    { id: 'search', label: 'Rechercher', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'news', label: 'News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: 'favorites', label: 'Favoris', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { id: 'profile', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 56, background: '#fff', borderTop: `1px solid ${COLORS.border}`, flexShrink: 0, paddingBottom: 2 }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', color: isActive ? COLORS.primary : COLORS.textLight, transition: 'color 0.2s' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={tab.icon}></path></svg>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: '0.01em' }}>{tab.label}</span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: 2, background: COLORS.primary, marginTop: -1 }}></div>}
          </button>
        );
      })}
    </div>
  );
}

// ── Listing Card ──
function ListingCard({ listing, onTap, onFav, isFav }) {
  const [pressed, setPressed] = useState(false);
  const hues = [210, 160, 30, 280, 190, 340];
  const hue = hues[listing.id % hues.length];

  return (
    <div onClick={() => onTap(listing)} onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
      style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transform: pressed ? 'scale(0.97)' : 'scale(1)', transition: 'transform 0.15s ease' }}>
      <div style={{ position: 'relative', height: 140, background: `linear-gradient(135deg, oklch(0.7 0.12 ${hue}), oklch(0.55 0.14 ${hue + 30}))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, opacity: 0.5 }}>🏠</span>
        {listing.verified && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: COLORS.secondary, color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
            Vérifié
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); onFav(listing.id); }} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? COLORS.danger : 'none'} stroke={isFav ? COLORS.danger : '#999'} strokeWidth="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
        <div style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10 }}>1/{listing.images}</div>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.text, lineHeight: 1.3, flex: 1, marginRight: 8 }}>{listing.title}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: COLORS.accent, fontWeight: 600, flexShrink: 0 }}>★ {listing.rating}</span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 8 }}>{listing.district} · {listing.distance}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.primary }}>{listing.price.toLocaleString('fr-FR')} <span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textLight }}>{listing.currency}{listing.period}</span></span>
          <span style={{ fontSize: 11, color: COLORS.textLight }}>{listing.area} m²</span>
        </div>
      </div>
    </div>
  );
}

// ── Badge ──
function Badge({ label, color, bg }) {
  return <span style={{ fontSize: 11, fontWeight: 600, color: color || '#fff', background: bg || COLORS.primary, padding: '3px 10px', borderRadius: 20 }}>{label}</span>;
}

// ── Placeholder Image ──
function PlaceholderImg({ hue, height, icon, style }) {
  return (
    <div style={{ height: height || 200, background: `linear-gradient(135deg, oklch(0.72 0.1 ${hue || 210}), oklch(0.55 0.13 ${(hue || 210) + 35}))`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <span style={{ fontSize: 48, opacity: 0.4 }}>{icon || '🏠'}</span>
    </div>
  );
}

Object.assign(window, { PageTransition, BottomTabBar, ListingCard, Badge, PlaceholderImg });

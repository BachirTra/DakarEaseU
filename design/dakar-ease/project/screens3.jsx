// screens3.jsx — SchoolDetail + RestaurantScreen + RestaurantDetail

const { useState, useEffect } = React;

// ════ SCHOOL DETAIL ════
function SchoolDetail({ school, onBack }) {
  const [tab, setTab] = useState('info'); // info, admission, logements
  if (!school) return null;
  const relatedListings = (school.logements || []).map(id => LISTINGS.find(l => l.id === id)).filter(Boolean);

  const tabs = [
    { id: 'info', label: 'Infos' },
    { id: 'admission', label: 'Admission' },
    { id: 'logements', label: 'Logements' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 220, marginTop: -62, background: `linear-gradient(135deg, oklch(0.55 0.18 ${school.hue}), oklch(0.35 0.2 ${school.hue + 30}))`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 20px 20px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 70, left: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 24, fontWeight: 800, color: '#fff' }}>
          {school.name.slice(0, 2)}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{school.name}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>{school.full}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 10 }}>🎓 {school.students} étudiants</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 10 }}>📍 {school.district}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 10 }}>Fondée en {school.founded}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? COLORS.primary : COLORS.textLight, borderBottom: `2px solid ${tab === t.id ? COLORS.primary : 'transparent'}`, transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 100px' }}>

        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Frais */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Frais de scolarité</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{school.frais}</div>
            </div>

            {/* Filières */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Filières proposées</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {school.filieres.map(f => (
                  <span key={f} style={{ padding: '6px 12px', background: `oklch(0.95 0.04 ${school.hue})`, color: `oklch(0.35 0.15 ${school.hue})`, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Bourses */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Bourses disponibles</div>
              {school.bourses.map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.secondary, flexShrink: 0 }}></div>
                  <span style={{ fontSize: 13, color: COLORS.text }}>{b}</span>
                </div>
              ))}
            </div>

            {/* Contacts */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Contacts & Accès</div>
              <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <svg width="16" height="16" fill="none" stroke={COLORS.textLight} strokeWidth="2" viewBox="0 0 24 24" style={{ marginTop: 1, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{school.address}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href={`https://wa.me/${school.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', background: '#25D366', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp
                </a>
                <a href={`tel:${school.phone}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  <svg width="16" height="16" fill="none" stroke={COLORS.text} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92z"></path></svg>
                  Appeler
                </a>
                <a href={`mailto:${school.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  <svg width="16" height="16" fill="none" stroke={COLORS.text} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Email
                </a>
              </div>
            </div>
          </div>
        )}

        {tab === 'admission' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Processus d'admission</div>
              {school.admission.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `oklch(0.55 0.18 ${school.hue})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{step}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: `oklch(0.95 0.04 ${school.hue})`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: `oklch(0.35 0.15 ${school.hue})`, marginBottom: 6 }}>💡 Conseil Dakar'ease</div>
              <div style={{ fontSize: 12, color: `oklch(0.4 0.12 ${school.hue})`, lineHeight: 1.6 }}>Prépare ton dossier 3 mois à l'avance. Contacte directement le service des admissions via WhatsApp pour avoir les dernières informations.</div>
            </div>
            <a href={`https://wa.me/${school.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px', background: '#25D366', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Contacter l'admission via WhatsApp
            </a>
          </div>
        )}

        {tab === 'logements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {relatedListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.textLight }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
                <div style={{ fontSize: 14 }}>Aucun logement associé pour l'instant.</div>
              </div>
            ) : relatedListings.map(l => (
              <div key={l.id} style={{ display: 'flex', background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <PlaceholderImg hue={200 + l.id * 25} height={90} icon="🏠" style={{ width: 100, flexShrink: 0 }} />
                <div style={{ padding: '12px 14px', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textLight }}>{l.district} · {l.distance}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, marginTop: 6 }}>{l.price.toLocaleString('fr-FR')} <span style={{ fontSize: 10, fontWeight: 400 }}>CFA/mois</span></div>
                </div>
              </div>
            ))}
            <div style={{ background: `oklch(0.95 0.03 ${school.hue})`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: `oklch(0.4 0.12 ${school.hue})` }}>Voir tous les logements proches de {school.name}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════ RESTAURANT SCREEN (liste) ════
function RestaurantScreen({ onBack, onViewRestaurant }) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const types = ['Tous', 'Sénégalais', 'Fast Food', 'Grillades', 'Café & Snack', 'Pizza & Pâtes'];
  const filtered = RESTAURANTS.filter(r => {
    const matchType = selectedType === 'Tous' || r.type === selectedType;
    const matchQuery = !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.district.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', background: '#fff', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg width="22" height="22" fill="none" stroke={COLORS.text} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: COLORS.text, flex: 1 }}>Restaurants</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: COLORS.bg, borderRadius: 12, padding: '10px 14px', border: `1px solid ${COLORS.border}`, marginBottom: 10 }}>
          <svg width="16" height="16" fill="none" stroke={COLORS.textLight} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Restaurant, quartier..." style={{ flex: 1, border: 'none', background: 'none', fontSize: 13, color: COLORS.text, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {types.map(tp => (
            <button key={tp} onClick={() => setSelectedType(tp)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${selectedType === tp ? COLORS.primary : COLORS.border}`, background: selectedType === tp ? COLORS.primary : '#fff', color: selectedType === tp ? '#fff' : COLORS.text, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => onViewRestaurant(r)} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <PlaceholderImg hue={r.hue} height={140} icon="🍽️" />
                {r.hasDelivery && (
                  <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, background: '#fff', color: COLORS.text, padding: '3px 8px', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>🛵 Livraison</span>
                )}
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{r.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: COLORS.text, fontWeight: 600 }}>
                    <span style={{ color: '#F59E0B' }}>★</span>{r.rating} <span style={{ color: COLORS.textLight, fontWeight: 400 }}>({r.reviews})</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 6 }}>{r.type} · {r.district} · {r.distance}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{r.price}</span>
                  <span style={{ fontSize: 11, color: COLORS.textLight }}>🕐 {r.openHours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════ RESTAURANT DETAIL ════
function RestaurantDetail({ restaurant, onBack }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  if (!restaurant) return null;
  const r = restaurant;
  const priceBase = parseInt((r.price.match(/\d[\d\s]*/) || ['1500'])[0].replace(/\s/g, '')) || 1500;
  const menu = r.specialites.map((s, i) => ({ name: s, price: priceBase + i * 750 }));

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#fff' }}>
      {/* Hero */}
      <div style={{ position: 'relative', marginTop: -62 }}>
        <PlaceholderImg hue={r.hue + imgIndex * 20} height={280} icon="🍽️" />
        <button onClick={onBack} style={{ position: 'absolute', top: 70, left: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {Array.from({ length: r.images }, (_, i) => (
            <div key={i} onClick={() => setImgIndex(i)} style={{ width: i === imgIndex ? 20 : 8, height: 8, borderRadius: 4, background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s', cursor: 'pointer' }}></div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 120px' }}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: '0 0 4px' }}>{r.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700 }}>
              <span style={{ color: '#F59E0B' }}>★</span>{r.rating}
              <span style={{ fontSize: 12, color: COLORS.textLight, fontWeight: 400 }}>({r.reviews})</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: COLORS.textLight }}>{r.type} · {r.district} · {r.distance}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {r.hasDelivery && <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', background: `${COLORS.secondary}15`, color: COLORS.secondary, borderRadius: 20 }}>🛵 Livraison disponible</span>}
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', background: COLORS.bg, color: COLORS.text, borderRadius: 20 }}>🕐 {r.openHours}</span>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6, marginBottom: 20 }}>{r.description}</p>

        {/* Spécialités */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Spécialités</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {r.specialites.map(s => (
            <span key={s} style={{ padding: '7px 14px', background: COLORS.bg, borderRadius: 20, fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{s}</span>
          ))}
        </div>

        {/* Prix */}
        <div style={{ padding: 16, background: COLORS.bg, borderRadius: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>Fourchette de prix</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{r.price}</div>
          </div>
          <div style={{ fontSize: 32 }}>🍽️</div>
        </div>
      </div>

      {/* Menu sheet */}
      {showMenu && (
        <div onClick={() => setShowMenu(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '78%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: COLORS.border, margin: '0 auto 12px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Menu — {r.name}</h3>
                <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: COLORS.textLight, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            <div style={{ overflow: 'auto', padding: '8px 20px 16px' }}>
              {menu.map(m => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `oklch(0.85 0.07 ${r.hue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🍲</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 700, marginTop: 2 }}>{m.price.toLocaleString('fr-FR')} CFA</div>
                  </div>
                  <button style={{ flexShrink: 0, padding: '7px 14px', background: `${COLORS.primary}10`, color: COLORS.primary, border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>+ Ajouter</button>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px 20px', borderTop: `1px solid ${COLORS.border}` }}>
              {r.hasDelivery ? (
                <a href={`https://wa.me/${r.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent('Bonjour ' + r.name + ', je souhaite commander en livraison via Dakar\'ease.')}`} target="_blank" rel="noopener" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#25D366', color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>🛵 Commander en livraison</a>
              ) : (
                <a href={`tel:${r.phone}`} style={{ display: 'block', textAlign: 'center', padding: '14px', background: COLORS.primary, color: '#fff', borderRadius: 14, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>📞 Commander par téléphone</a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 20px 16px', background: '#fff', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 10 }}>
        <a href={`https://wa.me/${r.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener" style={{ width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px', background: '#25D366', color: '#fff', borderRadius: 12, textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </a>
        <button onClick={() => setShowMenu(true)} style={{ flex: 1, padding: '13px', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          🍽️ {r.hasDelivery ? 'Voir le menu & commander' : 'Voir le menu'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SchoolDetail, RestaurantScreen, RestaurantDetail });

// screens4.jsx — DemandeScreen (recherche guidée / algo) + AdminDashboard

const { useState, useMemo } = React;

// ════════════════════════════════════════════
//  MOTEUR DE MATCHING (algo basé sur métadonnées)
// ════════════════════════════════════════════
function listingMinPrice(l) {
  const coloc = l.colocation || { available: false, places: [] };
  if (coloc.available && coloc.places.length) {
    return Math.min(l.price, ...coloc.places.filter(p => p.available).map(p => p.price));
  }
  return l.price;
}

function computeMatches(crit) {
  return LISTINGS.map(l => {
    let score = 0, max = 0;
    const reasons = [];
    const minP = listingMinPrice(l);
    const coloc = l.colocation || { available: false, places: [] };

    // Type
    if (crit.type && crit.type !== 'any') {
      max += 30;
      if (crit.type === 'coloc') {
        if (coloc.available) { score += 30; reasons.push('Colocation disponible'); }
      } else if (l.type === crit.type) { score += 30; reasons.push('Type ' + l.type); }
    }
    // Budget (toujours actif)
    max += 25;
    if (minP <= crit.budget) { score += 25; reasons.push('Dans le budget'); }
    else if (minP <= crit.budget * 1.12) { score += 12; }
    // École de proximité
    if (crit.school) {
      max += 25;
      const sc = SCHOOLS.find(s => s.name === crit.school);
      if (sc && (sc.logements || []).includes(l.id)) { score += 25; reasons.push('Proche ' + sc.name); }
      else if (sc && sc.district === l.district) { score += 12; reasons.push('Même quartier que ' + sc.name); }
    } else if (crit.district && crit.district !== 'any') {
      // Quartier (si pas d'école choisie)
      max += 20;
      if (l.district === crit.district) { score += 20; reasons.push(l.district); }
    }
    // Meublé
    if (crit.furnished && crit.furnished !== 'any') {
      max += 10;
      const wantFurnished = crit.furnished === 'yes';
      if (!!l.furnished === wantFurnished) { score += 10; reasons.push(wantFurnished ? 'Meublé' : 'Non meublé'); }
    }
    // Colocation préférence (si pas déjà dans type)
    if (crit.coloc && crit.coloc !== 'any' && crit.type !== 'coloc') {
      max += 15;
      const wantColoc = crit.coloc === 'yes';
      if (coloc.available === wantColoc) { score += 15; reasons.push(wantColoc ? 'Coloc OK' : 'Privatif'); }
    }
    // Durée
    max += 10;
    if ((l.dureeMin || 3) <= crit.months) { score += 10; }

    const pct = max > 0 ? Math.round((score / max) * 100) : 100;
    return { listing: l, pct, reasons };
  }).sort((a, b) => b.pct - a.pct);
}

// ════════════════════════════════════════════
//  DEMANDE — recherche guidée
// ════════════════════════════════════════════
function DemandeScreen({ onBack, onViewListing }) {
  const [step, setStep] = useState(0);
  const [crit, setCrit] = useState({ type: 'any', school: '', district: 'any', budget: 200000, furnished: 'any', coloc: 'any', months: 3 });
  const set = (k, v) => setCrit(c => ({ ...c, [k]: v }));
  const results = useMemo(() => step === 4 ? computeMatches(crit) : [], [step, crit]);

  const TYPES = [
    { id: 'any', label: 'Indifférent', icon: '✨' },
    { id: 'Studio', label: 'Studio', icon: '🛋️' },
    { id: 'Chambre', label: 'Chambre', icon: '🛏️' },
    { id: 'Appartement', label: 'Appartement', icon: '🏢' },
    { id: 'coloc', label: 'Colocation', icon: '👥' },
  ];

  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ padding: '9px 16px', borderRadius: 22, border: `1.5px solid ${active ? COLORS.primary : COLORS.border}`, background: active ? COLORS.primary : '#fff', color: active ? '#fff' : COLORS.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>{children}</button>
  );

  // ── Résultats ──
  if (step === 4) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
        <div style={{ padding: '18px 20px 14px', background: '#fff', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <svg width="22" height="22" fill="none" stroke={COLORS.text} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Tes meilleurs matchs</h2>
              <div style={{ fontSize: 12, color: COLORS.textLight }}>Classés par compatibilité avec ta demande</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {results.map(({ listing, pct, reasons }) => (
              <div key={listing.id} onClick={() => onViewListing(listing)} style={{ display: 'flex', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: 110, flexShrink: 0 }}>
                  <PlaceholderImg hue={200 + listing.id * 25} height={140} icon="🏠" style={{ width: 110, height: '100%' }} />
                  <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 10, background: pct >= 75 ? COLORS.secondary : pct >= 50 ? COLORS.accent : COLORS.textLight, color: '#fff' }}>{pct}%</span>
                </div>
                <div style={{ padding: '12px 14px', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>{listing.title}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.textLight, marginBottom: 6 }}>{listing.district} · {listing.type} · {listing.area} m²</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {reasons.slice(0, 3).map(r => <span key={r} style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', background: `${COLORS.secondary}14`, color: COLORS.secondary, borderRadius: 8 }}>✓ {r}</span>)}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.primary }}>{listingMinPrice(listing).toLocaleString('fr-FR')} <span style={{ fontSize: 10, fontWeight: 400, color: COLORS.textLight }}>CFA/mois</span></div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(0)} style={{ width: '100%', marginTop: 20, padding: '13px', background: '#fff', border: `1.5px solid ${COLORS.border}`, borderRadius: 14, fontSize: 14, fontWeight: 600, color: COLORS.text, cursor: 'pointer' }}>↻ Recommencer ma demande</button>
        </div>
      </div>
    );
  }

  const steps = ['Type', 'Localisation', 'Budget & durée', 'Préférences'];
  const canNext = true;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ padding: '18px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => step > 0 ? setStep(step - 1) : onBack()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg width="22" height="22" fill="none" stroke={COLORS.text} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div style={{ fontSize: 12, color: COLORS.textLight, fontWeight: 600 }}>Étape {step + 1}/4 · {steps[step]}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? COLORS.primary : COLORS.border, transition: 'background 0.3s' }}></div>)}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px' }}>
        {step === 0 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Quel type de logement ?</h2>
            <p style={{ fontSize: 13, color: COLORS.textLight, margin: '0 0 20px' }}>Choisis ce qui te correspond le mieux.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TYPES.map(tp => (
                <button key={tp.id} onClick={() => set('type', tp.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: crit.type === tp.id ? `${COLORS.primary}0c` : '#fff', border: `2px solid ${crit.type === tp.id ? COLORS.primary : COLORS.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 24 }}>{tp.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{tp.label}</span>
                  {crit.type === tp.id && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Où veux-tu vivre ?</h2>
            <p style={{ fontSize: 13, color: COLORS.textLight, margin: '0 0 18px' }}>Proche de ton école, ou dans un quartier précis.</p>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Mon école</div>
            <select value={crit.school} onChange={e => set('school', e.target.value)} style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${COLORS.border}`, borderRadius: 12, fontSize: 14, background: '#fff', color: crit.school ? COLORS.text : COLORS.textLight, marginBottom: 22 }}>
              <option value="">Aucune préférence d'école</option>
              {SCHOOLS.map(s => <option key={s.id} value={s.name}>{s.name} — {s.district}</option>)}
            </select>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Quartier</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Chip active={crit.district === 'any'} onClick={() => set('district', 'any')}>Indifférent</Chip>
              {DISTRICTS.map(d => <Chip key={d} active={crit.district === d} onClick={() => set('district', d)}>{d}</Chip>)}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Budget & durée</h2>
            <p style={{ fontSize: 13, color: COLORS.textLight, margin: '0 0 22px' }}>On filtre selon tes moyens et ton séjour.</p>
            <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 8 }}>Budget mensuel max : <strong style={{ color: COLORS.text, fontSize: 16 }}>{crit.budget.toLocaleString('fr-FR')} CFA</strong></div>
            <input type="range" min={50000} max={350000} step={5000} value={crit.budget} onChange={e => set('budget', +e.target.value)} style={{ width: '100%', accentColor: COLORS.primary, marginBottom: 28 }} />
            <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 10 }}>Durée du séjour <span style={{ color: COLORS.textLight }}>(min. 3 mois)</span></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[3, 6, 9, 12].map(m => <Chip key={m} active={crit.months === m} onClick={() => set('months', m)}>{m} mois</Chip>)}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Tes préférences</h2>
            <p style={{ fontSize: 13, color: COLORS.textLight, margin: '0 0 22px' }}>Dernière étape avant tes résultats.</p>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Meublé ?</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <Chip active={crit.furnished === 'any'} onClick={() => set('furnished', 'any')}>Peu importe</Chip>
              <Chip active={crit.furnished === 'yes'} onClick={() => set('furnished', 'yes')}>Meublé</Chip>
              <Chip active={crit.furnished === 'no'} onClick={() => set('furnished', 'no')}>Non meublé</Chip>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Ouvert à la colocation ?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Chip active={crit.coloc === 'any'} onClick={() => set('coloc', 'any')}>Peu importe</Chip>
              <Chip active={crit.coloc === 'yes'} onClick={() => set('coloc', 'yes')}>Oui</Chip>
              <Chip active={crit.coloc === 'no'} onClick={() => set('coloc', 'no')}>Logement privatif</Chip>
            </div>
            <div style={{ marginTop: 28, padding: 16, background: COLORS.bg, borderRadius: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textLight, marginBottom: 10 }}>Récapitulatif de ta demande</div>
              {[
                ['Type', crit.type === 'any' ? 'Indifférent' : crit.type === 'coloc' ? 'Colocation' : crit.type],
                ['Localisation', crit.school || (crit.district === 'any' ? 'Indifférent' : crit.district)],
                ['Budget max', crit.budget.toLocaleString('fr-FR') + ' CFA'],
                ['Durée', crit.months + ' mois'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span style={{ color: COLORS.textLight }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '12px 20px 20px', borderTop: `1px solid ${COLORS.border}` }}>
        <button onClick={() => setStep(step + 1)} disabled={!canNext} style={{ width: '100%', padding: '15px', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {step < 3 ? 'Continuer' : '🎯 Voir mes logements compatibles'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  ADMIN DASHBOARD (propriétaires de l'app)
// ════════════════════════════════════════════
function AdminDashboard({ onBack }) {
  const [tab, setTab] = useState('overview');
  const [statuses, setStatuses] = useState(() => Object.fromEntries(LISTINGS.map(l => [l.id, l.verified ? 'online' : 'review'])));
  const toggleStatus = (id) => setStatuses(s => ({ ...s, [id]: s[id] === 'online' ? 'review' : 'online' }));

  const onlineCount = Object.values(statuses).filter(s => s === 'online').length;
  const kpis = [
    { label: 'Annonces en ligne', value: onlineCount, sub: `/ ${LISTINGS.length} total`, icon: '🏠', hue: 215 },
    { label: 'Réservations (mois)', value: 38, sub: '+12% vs M-1', icon: '📋', hue: 160 },
    { label: 'Demandes en attente', value: 14, sub: 'à traiter', icon: '🎯', hue: 30 },
    { label: 'Revenus (mois)', value: '4,2M', sub: 'CFA · commissions', icon: '💰', hue: 280 },
  ];

  const demandes = [
    { name: 'Aminata D.', crit: 'Studio · Fann · ≤ 180k', date: 'il y a 2h', school: 'UCAD' },
    { name: 'Mor S.', crit: 'Colocation · Mermoz · ≤ 100k', date: 'il y a 5h', school: 'ISM' },
    { name: 'Fatou B.', crit: 'Appartement · Point E · ≤ 250k', date: 'hier', school: 'UCAD' },
    { name: 'Cheikh N.', crit: 'Chambre · Ouakam · ≤ 95k', date: 'hier', school: 'ESP' },
    { name: 'Awa T.', crit: 'Studio · Almadies · ≤ 200k', date: 'il y a 2j', school: 'Sup de Co' },
  ];

  const reservations = [
    { logement: 'Studio meublé Almadies', loc: 'Aminata D.', mois: 6, montant: '1 080 000', statut: 'Confirmée' },
    { logement: 'Chambre colocation Fann', loc: 'Mor S.', mois: 3, montant: '255 000', statut: 'En cours' },
    { logement: 'F2 moderne Point E', loc: 'Awa T.', mois: 12, montant: '2 400 000', statut: 'Confirmée' },
    { logement: 'Chambre meublée Ouakam', loc: 'Cheikh N.', mois: 3, montant: '285 000', statut: 'En attente' },
  ];

  const statutColor = (s) => s === 'Confirmée' ? COLORS.secondary : s === 'En attente' ? COLORS.accent : COLORS.primary;

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'listings', label: 'Annonces' },
    { id: 'demandes', label: 'Demandes' },
    { id: 'reservations', label: 'Réservations' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}>
      {/* Header */}
      <div style={{ background: COLORS.text, padding: '18px 20px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Admin · Dakar'ease</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>🔒 Espace propriétaires de l'app</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>DE</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '12px 20px', background: '#fff', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: 'none', background: tab === t.id ? COLORS.text : COLORS.bg, color: tab === t.id ? '#fff' : COLORS.text, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 40px' }}>
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {kpis.map(k => (
                <div key={k.label} style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `oklch(0.92 0.05 ${k.hue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{k.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, lineHeight: 1 }}>{k.value}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.text, fontWeight: 600, marginTop: 4 }}>{k.label}</div>
                  <div style={{ fontSize: 10.5, color: COLORS.textLight, marginTop: 2 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Réservations · 6 derniers mois</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110 }}>
                {[18, 24, 21, 30, 27, 38].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', height: v * 2.4, borderRadius: '6px 6px 0 0', background: i === 5 ? COLORS.primary : `${COLORS.primary}44` }}></div>
                    <span style={{ fontSize: 9.5, color: COLORS.textLight }}>{['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Taux d'occupation par quartier</div>
              {[['Fann', 92], ['Point E', 85], ['Mermoz', 78], ['Almadies', 64]].map(([d, p]) => (
                <div key={d} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: COLORS.text, fontWeight: 600 }}>{d}</span><span style={{ color: COLORS.textLight }}>{p}%</span></div>
                  <div style={{ height: 7, borderRadius: 4, background: COLORS.bg, overflow: 'hidden' }}><div style={{ width: p + '%', height: '100%', background: COLORS.secondary }}></div></div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LISTINGS.map(l => {
              const st = statuses[l.id];
              return (
                <div key={l.id} style={{ background: '#fff', borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <PlaceholderImg hue={200 + l.id * 25} height={52} icon="🏠" style={{ width: 52, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{l.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.textLight }}>{l.district} · {l.price.toLocaleString('fr-FR')} CFA · {l.reviews} avis</div>
                  </div>
                  <button onClick={() => toggleStatus(l.id)} style={{ flexShrink: 0, padding: '6px 11px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: st === 'online' ? `${COLORS.secondary}18` : `${COLORS.accent}18`, color: st === 'online' ? COLORS.secondary : COLORS.accent }}>
                    {st === 'online' ? '● En ligne' : '○ À valider'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'demandes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 2 }}>Demandes étudiantes issues de la recherche guidée</div>
            {demandes.map((d, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${COLORS.primary}14`, color: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{d.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{d.name} <span style={{ fontSize: 11, color: COLORS.textLight, fontWeight: 400 }}>· {d.school}</span></div>
                    <div style={{ fontSize: 11, color: COLORS.textLight }}>{d.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.text, background: COLORS.bg, padding: '8px 12px', borderRadius: 10, marginBottom: 10 }}>🎯 {d.crit}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, padding: '9px', background: COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Proposer un logement</button>
                  <button style={{ padding: '9px 14px', background: COLORS.bg, color: COLORS.textLight, border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Ignorer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'reservations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reservations.map((r, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text }}>{r.logement}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${statutColor(r.statut)}18`, color: statutColor(r.statut) }}>{r.statut}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: COLORS.textLight }}>👤 {r.loc} · ⏳ {r.mois} mois</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.primary }}>{r.montant} CFA</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DemandeScreen, AdminDashboard });

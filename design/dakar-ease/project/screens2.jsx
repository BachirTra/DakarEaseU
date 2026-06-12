// Screens 2: Listing detail, Reservation, News, Transport, Schools, Profile, Favorites

const { useState, useEffect, useMemo } = React;

// ════ LISTING DETAIL ════
function ListingDetail({ listing, onBack, isFav, onToggleFav, onReserve }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [mediaView, setMediaView] = useState(null); // {type:'video'|'tour', i}
  if (!listing) return null;
  const hue = [210, 160, 30, 280, 190, 340][listing.id % 6];
  const coloc = listing.colocation || { available: false, places: [] };
  const colocPlaces = coloc.places || [];
  const dureeMin = listing.dureeMin || 3;

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#fff' }}>
      <div style={{ position: 'relative', marginTop: -62 }}>
        <PlaceholderImg hue={hue + imgIndex * 20} height={260} icon="🏠" />
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 56,
            left: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          onClick={() => onToggleFav(listing.id)}
          style={{
            position: 'absolute',
            top: 56,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isFav ? COLORS.danger : 'none'}
            stroke={isFav ? COLORS.danger : '#fff'}
            strokeWidth="2"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>
        {listing.tour3d && (
          <button
            onClick={() => setMediaView({ type: 'tour', i: 0 })}
            style={{
              position: 'absolute',
              bottom: 14,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              border: 'none',
              borderRadius: 20,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 14 }}>🌐</span> Visite 3D
          </button>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
          }}
        >
          {Array.from({ length: listing.images }, (_, i) => (
            <div
              key={i}
              onClick={() => setImgIndex(i)}
              style={{
                width: i === imgIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
            ></div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 120px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: '0 0 4px' }}>
              {listing.title}
            </h2>
            <div style={{ fontSize: 14, color: COLORS.textLight }}>{listing.district}, Dakar</div>
          </div>
          {listing.verified && <Badge label="Vérifié" bg={COLORS.secondary} />}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            padding: '16px 0',
            borderBottom: `1px solid ${COLORS.border}`,
            marginBottom: 16,
          }}
        >
          {[
            { l: `${listing.beds} Chambre`, i: '🛏️' },
            { l: `${listing.baths} SdB`, i: '🚿' },
            { l: `${listing.area} m²`, i: '📐' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{s.i}</span>
              <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{s.l}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>
            ★ {listing.rating}
          </span>
          <span style={{ fontSize: 13, color: COLORS.textLight }}>({listing.reviews} avis)</span>
        </div>

        {/* ── MÉDIAS : photos + vidéos + 3D ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 10,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, margin: 0 }}>Médias</h3>
          <span style={{ fontSize: 12, color: COLORS.textLight }}>
            📷 {listing.images} photos · 🎬 {listing.videos || 0} vidéo
            {(listing.videos || 0) > 1 ? 's' : ''}
            {listing.tour3d ? ' · 🌐 3D' : ''}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 6,
            marginBottom: 24,
          }}
        >
          {Array.from({ length: listing.videos || 0 }, (_, i) => (
            <div
              key={'v' + i}
              onClick={() => setMediaView({ type: 'video', i })}
              style={{
                position: 'relative',
                minWidth: 150,
                height: 96,
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
                background: `linear-gradient(135deg, oklch(0.5 0.13 ${hue + i * 25}), oklch(0.32 0.15 ${hue + 40}))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.primary}>
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Vidéo {i + 1}
              </span>
            </div>
          ))}
          {listing.tour3d && (
            <div
              onClick={() => setMediaView({ type: 'tour', i: 0 })}
              style={{
                position: 'relative',
                minWidth: 150,
                height: 96,
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 24 }}>🌐</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Visite 3D · 360°</span>
            </div>
          )}
          {Array.from({ length: Math.min(listing.images, 3) }, (_, i) => (
            <div
              key={'p' + i}
              onClick={() => setImgIndex(i)}
              style={{
                minWidth: 110,
                height: 96,
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <PlaceholderImg hue={hue + i * 20} height={96} icon="🏠" style={{ width: '100%' }} />
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
          Description
        </h3>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.7, margin: '0 0 20px' }}>
          {listing.description}
        </p>

        {/* ── PARTICULARITÉS ── */}
        {listing.particularites && listing.particularites.length > 0 && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>
              Particularités du logement
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {listing.particularites.map((p) => (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13.5,
                    color: COLORS.text,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={COLORS.secondary}
                    strokeWidth="2.5"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                  {p}
                </div>
              ))}
            </div>
          </>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>
          Équipements
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {listing.amenities.map((a) => (
            <span
              key={a}
              style={{
                padding: '6px 14px',
                background: COLORS.bg,
                borderRadius: 20,
                fontSize: 13,
                color: COLORS.text,
                fontWeight: 500,
              }}
            >
              {a}
            </span>
          ))}
        </div>

        {/* ── EXIGENCES & DURÉE ── */}
        {listing.exigences && listing.exigences.length > 0 && (
          <div style={{ background: COLORS.bg, borderRadius: 14, padding: 16, marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.text,
                margin: '0 0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              📋 Exigences & conditions
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {listing.exigences.map((e) => (
                <span
                  key={e}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    background: '#fff',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 20,
                    fontSize: 12.5,
                    color: COLORS.text,
                    fontWeight: 500,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
                padding: '10px 12px',
                background: `${COLORS.accent}14`,
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 16 }}>⏳</span>
              <span style={{ fontSize: 12.5, color: COLORS.text, fontWeight: 600 }}>
                Durée minimale de location : {dureeMin} mois
              </span>
            </div>
          </div>
        )}

        {/* ── COLOCATION ── */}
        <div
          style={{
            borderRadius: 14,
            padding: 16,
            marginBottom: 8,
            border: `1.5px solid ${coloc.available ? COLORS.secondary + '55' : COLORS.border}`,
            background: coloc.available ? `${COLORS.secondary}0c` : '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: coloc.available ? 12 : 0,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.text,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              👥 Colocation
            </h3>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 20,
                background: coloc.available ? COLORS.secondary : COLORS.border,
                color: coloc.available ? '#fff' : COLORS.textLight,
              }}
            >
              {coloc.available
                ? `${colocPlaces.length} place${colocPlaces.length > 1 ? 's' : ''}`
                : 'Non proposée'}
            </span>
          </div>
          {coloc.available ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {colocPlaces.map((pl) => (
                <div
                  key={pl.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 12px',
                    background: '#fff',
                    borderRadius: 12,
                    border: `1px solid ${COLORS.border}`,
                    opacity: pl.available ? 1 : 0.55,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: `${COLORS.primary}12`,
                      color: COLORS.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {pl.id}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                      {pl.label}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textLight }}>
                      {pl.area} m² · {pl.available ? 'Disponible' : 'Occupée'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.primary }}>
                      {pl.price.toLocaleString('fr-FR')}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.textLight }}>CFA/mois</div>
                  </div>
                  {pl.available && (
                    <button
                      onClick={() => onReserve(listing, pl)}
                      style={{
                        flexShrink: 0,
                        padding: '8px 12px',
                        background: COLORS.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Réserver
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: 12.5,
                color: COLORS.textLight,
                margin: '8px 0 0',
                lineHeight: 1.5,
              }}
            >
              Ce logement est proposé en location entière uniquement (pas de colocation).
            </p>
          )}
        </div>
      </div>

      {/* Media modal */}
      {mediaView && (
        <div
          onClick={() => setMediaView(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <button
            onClick={() => setMediaView(null)}
            style={{
              position: 'absolute',
              top: 60,
              right: 16,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: '#fff',
              fontSize: 20,
              cursor: 'pointer',
              zIndex: 60,
            }}
          >
            ✕
          </button>
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 16,
              overflow: 'hidden',
              background:
                mediaView.type === 'tour'
                  ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`
                  : `linear-gradient(135deg, oklch(0.45 0.13 ${hue}), oklch(0.28 0.15 ${hue + 40}))`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 52 }}>{mediaView.type === 'tour' ? '🌐' : '🎬'}</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
              {mediaView.type === 'tour'
                ? 'Visite virtuelle 360°'
                : `Lecture — Vidéo ${mediaView.i + 1}`}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{listing.title}</div>
            {mediaView.type === 'tour' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {['Salon', 'Chambre', 'Cuisine', 'SdB'].map((r) => (
                  <span
                    key={r}
                    style={{
                      fontSize: 11,
                      padding: '5px 11px',
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      borderRadius: 14,
                      fontWeight: 600,
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 16 }}>
            Touche pour fermer
          </div>
        </div>
      )}

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          padding: '12px 20px 16px',
          background: '#fff',
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: COLORS.textLight }}>À partir de</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: COLORS.primary, lineHeight: 1.1 }}>
            {(coloc.available && colocPlaces.length
              ? Math.min(...colocPlaces.map((p) => p.price))
              : listing.price
            ).toLocaleString('fr-FR')}{' '}
            <span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textLight }}>CFA/mois</span>
          </div>
        </div>
        <button
          onClick={() => onReserve(listing, null)}
          style={{
            padding: '13px 24px',
            background: COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Réserver
        </button>
      </div>
    </div>
  );
}

// ════ RESERVATION + REVIEW ════
function ReservationScreen({ listing, place, onBack, onDone }) {
  const minMonths = listing && listing.dureeMin ? listing.dureeMin : 3;
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('');
  const [months, setMonths] = useState(Math.max(3, minMonths));
  const [payment, setPayment] = useState('wave');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSent, setReviewSent] = useState(false);
  if (!listing) return null;
  const unitPrice = place ? place.price : listing.price;
  const total = unitPrice * months;
  const subtitle = place ? `${listing.title} · ${place.label}` : listing.title;

  const methods = [
    { id: 'wave', label: 'Wave', color: '#1DC3E0' },
    { id: 'orange', label: 'Orange Money', color: '#F26522' },
    { id: 'card', label: 'Carte bancaire', color: '#1E3A8A' },
  ];
  const confirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1500);
  };

  if (showReview && reviewSent) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          background: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Merci pour ton avis !</h2>
        <p style={{ fontSize: 14, color: COLORS.textLight, margin: '0 0 32px' }}>
          Ton avis aide la communauté étudiante.
        </p>
        <button
          onClick={onDone}
          style={{
            padding: '14px 40px',
            background: COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retour
        </button>
      </div>
    );
  }

  if (showReview) {
    return (
      <div style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${COLORS.border}` }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Évalue ton séjour</h2>
          <p style={{ fontSize: 13, color: COLORS.textLight, margin: '4px 0 0' }}>
            {listing.title}
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div style={{ fontSize: 14, color: COLORS.textLight }}>Note globale</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setReviewStars(n)}
                style={{
                  fontSize: 38,
                  cursor: 'pointer',
                  color: n <= reviewStars ? COLORS.accent : COLORS.border,
                  transition: 'transform 0.15s',
                  transform: n <= reviewStars ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Partage ton expérience..."
            rows={5}
            style={{
              width: '100%',
              padding: '14px',
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 12,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ padding: '12px 20px 20px' }}>
          <button
            onClick={() => setReviewSent(true)}
            disabled={reviewStars === 0}
            style={{
              width: '100%',
              padding: '15px',
              background: reviewStars === 0 ? COLORS.border : COLORS.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: reviewStars === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Publier
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          background: '#fff',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: COLORS.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            animation: 'popIn 0.4s ease',
          }}
        >
          <svg width="40" height="40" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
          Réservation confirmée !
        </h2>
        <p style={{ fontSize: 14, color: COLORS.textLight, margin: '0 0 32px', lineHeight: 1.6 }}>
          <strong>{subtitle}</strong>
          <br />
          {months} mois · {total.toLocaleString('fr-FR')} CFA — l'équipe Dakar'ease confirme ta
          demande sous 24h.
        </p>
        <button
          onClick={() => setShowReview(true)}
          style={{
            padding: '14px 28px',
            background: COLORS.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          ⭐ Laisser un avis (après séjour)
        </button>
        <button
          onClick={onDone}
          style={{
            padding: '14px 40px',
            background: COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke={COLORS.text}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Réservation</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px' }}>
        {['Date', 'Paiement', 'Confirmation'].map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= step ? COLORS.primary : COLORS.border,
              transition: 'background 0.3s',
            }}
          ></div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '8px 20px', overflow: 'auto' }}>
        {step === 0 && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>
              Date d'emménagement
            </h3>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 12,
                fontSize: 15,
                background: COLORS.bg,
                boxSizing: 'border-box',
              }}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '22px 0 6px' }}>
              Durée de location
            </h3>
            <p style={{ fontSize: 12, color: COLORS.textLight, margin: '0 0 12px' }}>
              Minimum {minMonths} mois pour ce logement.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: COLORS.bg,
                borderRadius: 14,
              }}
            >
              <button
                onClick={() => setMonths((m) => Math.max(minMonths, m - 1))}
                disabled={months <= minMonths}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: `1.5px solid ${COLORS.border}`,
                  background: '#fff',
                  fontSize: 22,
                  cursor: months <= minMonths ? 'not-allowed' : 'pointer',
                  color: months <= minMonths ? COLORS.border : COLORS.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, lineHeight: 1 }}>
                  {months}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>mois</div>
              </div>
              <button
                onClick={() => setMonths((m) => Math.min(24, m + 1))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: `1.5px solid ${COLORS.border}`,
                  background: '#fff',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: COLORS.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {[3, 6, 9, 12]
                .filter((p) => p >= minMonths)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setMonths(p)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      border: `1.5px solid ${months === p ? COLORS.primary : COLORS.border}`,
                      background: months === p ? COLORS.primary : '#fff',
                      color: months === p ? '#fff' : COLORS.text,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {p} mois
                  </button>
                ))}
            </div>

            <div style={{ marginTop: 20, padding: 16, background: COLORS.bg, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{subtitle}</div>
              <div style={{ fontSize: 13, color: COLORS.textLight }}>
                {listing.district} · {listing.type}
                {place ? ' · Colocation' : ''}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary, marginTop: 8 }}>
                {unitPrice.toLocaleString('fr-FR')} CFA/mois
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Mode de paiement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 16,
                    background: payment === m.id ? `${m.color}10` : '#fff',
                    border: `2px solid ${payment === m.id ? m.color : COLORS.border}`,
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: m.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    {m.label[0]}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Récapitulatif</h3>
            <div
              style={{
                padding: 16,
                background: COLORS.bg,
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: COLORS.textLight }}>Logement</span>
                <span style={{ fontWeight: 600 }}>{listing.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: COLORS.textLight }}>Date</span>
                <span style={{ fontWeight: 600 }}>{date || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: COLORS.textLight }}>Paiement</span>
                <span style={{ fontWeight: 600 }}>
                  {methods.find((m) => m.id === payment)?.label}
                </span>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${COLORS.border}`,
                  paddingTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: COLORS.primary }}>
                  {listing.price.toLocaleString('fr-FR')} CFA
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ padding: '12px 20px 20px' }}>
        <button
          onClick={() => (step < 2 ? setStep(step + 1) : confirm())}
          disabled={(step === 0 && !date) || loading}
          style={{
            width: '100%',
            padding: '15px',
            background: step === 0 && !date ? COLORS.border : COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Traitement...' : step < 2 ? 'Continuer' : 'Confirmer et payer'}
        </button>
      </div>
    </div>
  );
}

// ════ NEWS / EVENTS ════
function NewsScreen({ savedEvents, onToggleSave, onViewEvent }) {
  const [cat, setCat] = useState('all');
  const cats = [
    { id: 'all', label: 'Tous' },
    { id: 'Concert', label: 'Concert' },
    { id: 'Festival', label: 'Festival' },
    { id: 'Conférence', label: 'Conférence' },
    { id: 'Sport', label: 'Sport' },
  ];
  const filtered = useMemo(
    () => (cat === 'all' ? EVENTS : EVENTS.filter((e) => e.cat === cat)),
    [cat],
  );
  const featured = EVENTS.find((e) => e.featured && (cat === 'all' || e.cat === cat));

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}
    >
      <div
        style={{
          padding: '20px 20px 12px',
          background: '#fff',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>News & Événements</h2>
        <p style={{ fontSize: 12, color: COLORS.textLight, margin: 0 }}>
          Vis Dakar à fond — partenaires Sorano, Institut Français, Festival Salam…
        </p>
        <div
          style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 14, paddingBottom: 4 }}
        >
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: 20,
                border: `1.5px solid ${cat === c.id ? COLORS.primary : COLORS.border}`,
                background: cat === c.id ? COLORS.primary : '#fff',
                color: cat === c.id ? '#fff' : COLORS.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 100px' }}>
        {featured && cat === 'all' && (
          <div
            onClick={() => onViewEvent(featured)}
            style={{
              position: 'relative',
              height: 180,
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 20,
              cursor: 'pointer',
              background: `linear-gradient(135deg, oklch(0.7 0.13 ${featured.hue}), oklch(0.45 0.16 ${featured.hue + 30}))`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 16,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'rgba(255,255,255,0.25)',
                  padding: '3px 10px',
                  borderRadius: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                }}
              >
                À LA UNE · {featured.cat}
              </span>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {featured.title}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                {featured.date} · {featured.venue}
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered
            .filter((e) => !(cat === 'all' && e.id === featured?.id))
            .map((ev) => (
              <div
                key={ev.id}
                onClick={() => onViewEvent(ev)}
                style={{
                  display: 'flex',
                  background: '#fff',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 110,
                    flexShrink: 0,
                    background: `linear-gradient(135deg, oklch(0.7 0.13 ${ev.hue}), oklch(0.5 0.16 ${ev.hue + 30}))`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    padding: 8,
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.85 }}>{ev.date.split(' ')[1]}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                    {ev.date.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.85, marginTop: 4 }}>{ev.time}</div>
                </div>
                <div
                  style={{
                    padding: '12px 14px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: COLORS.primary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 4,
                    }}
                  >
                    {ev.cat}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}
                  >
                    {ev.title}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 6 }}>
                    {ev.venue} · {ev.partner}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: ev.priceVal === 0 ? COLORS.secondary : COLORS.primary,
                      }}
                    >
                      {ev.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(ev.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={savedEvents.has(ev.id) ? COLORS.accent : 'none'}
                        stroke={savedEvents.has(ev.id) ? COLORS.accent : COLORS.textLight}
                        strokeWidth="2"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ════ EVENT DETAIL: RSVP → TICKET → CHECK-IN ════
function EventDetail({ event, onBack, isSaved, onToggleSave }) {
  const [step, setStep] = useState('view'); // view, ticket, checkedin
  const [going, setGoing] = useState(false);
  if (!event) return null;

  const rsvp = () => {
    setGoing(true);
    setTimeout(() => setStep('ticket'), 400);
  };
  const checkin = () => {
    setStep('checkedin');
  };

  if (step === 'checkedin') {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          textAlign: 'center',
          background: `linear-gradient(160deg, ${COLORS.secondary}, oklch(0.6 0.14 165))`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            animation: 'popIn 0.4s ease',
          }}
        >
          <svg width="56" height="56" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
          Check-in OK !
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 32px' }}>
          Bon événement à toi ✨
        </p>
        <button
          onClick={onBack}
          style={{
            padding: '14px 40px',
            background: '#fff',
            color: COLORS.text,
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retour aux événements
        </button>
      </div>
    );
  }

  if (step === 'ticket') {
    return (
      <div
        style={{
          height: '100%',
          overflow: 'auto',
          background: COLORS.bg,
          padding: '20px 20px 80px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: 16,
          }}
        >
          <svg
            width="22"
            height="22"
            fill="none"
            stroke={COLORS.text}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, oklch(0.65 0.14 ${event.hue}), oklch(0.45 0.16 ${event.hue + 30}))`,
              padding: '24px 20px',
              color: '#fff',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: '0.1em', opacity: 0.85 }}>
              TICKET DAKAR'EASE
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{event.title}</div>
            <div
              style={{
                position: 'absolute',
                left: -10,
                top: '50%',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: COLORS.bg,
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                right: -10,
                top: '50%',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: COLORS.bg,
              }}
            ></div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase' }}>
                  Date
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{event.date}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase' }}>
                  Heure
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{event.time}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase' }}>
                  Lieu
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{event.venue}</div>
              </div>
            </div>
            <div
              style={{
                borderTop: `1px dashed ${COLORS.border}`,
                padding: '16px 0',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 160,
                  background:
                    'repeating-linear-gradient(0deg, #000, #000 4px, #fff 4px, #fff 7px), repeating-linear-gradient(90deg, #000, #000 4px, #fff 4px, #fff 7px)',
                  backgroundBlendMode: 'multiply',
                  borderRadius: 8,
                }}
              ></div>
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: COLORS.textLight,
                marginBottom: 4,
              }}
            >
              N° AMINATA-{event.id.toString().padStart(4, '0')}
            </div>
          </div>
        </div>
        <button
          onClick={checkin}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '15px',
            background: COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📲 Check-in à l'entrée
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent('Je vais à ' + event.title + ' le ' + event.date + " via Dakar'ease !")}`}
          target="_blank"
          rel="noopener"
          style={{
            display: 'block',
            marginTop: 10,
            padding: '13px',
            textAlign: 'center',
            background: '#25D366',
            color: '#fff',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Partager sur WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div
        style={{
          position: 'relative',
          height: 220,
          marginTop: -62,
          background: `linear-gradient(135deg, oklch(0.7 0.13 ${event.hue}), oklch(0.45 0.16 ${event.hue + 30}))`,
          display: 'flex',
          alignItems: 'flex-end',
          padding: 20,
        }}
      >
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 56,
            left: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          onClick={() => onToggleSave(event.id)}
          style={{
            position: 'absolute',
            top: 56,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isSaved ? COLORS.accent : 'none'}
            stroke="#fff"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
          </svg>
        </button>
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#fff',
              background: 'rgba(255,255,255,0.25)',
              padding: '3px 10px',
              borderRadius: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {event.cat}
          </span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 8 }}>
            {event.title}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: 12, background: COLORS.bg, borderRadius: 12 }}>
            <div
              style={{
                fontSize: 10,
                color: COLORS.textLight,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Date
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{event.date}</div>
          </div>
          <div style={{ flex: 1, padding: 12, background: COLORS.bg, borderRadius: 12 }}>
            <div
              style={{
                fontSize: 10,
                color: COLORS.textLight,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Heure
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{event.time}</div>
          </div>
          <div style={{ flex: 1, padding: 12, background: COLORS.bg, borderRadius: 12 }}>
            <div
              style={{
                fontSize: 10,
                color: COLORS.textLight,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Prix
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: event.priceVal === 0 ? COLORS.secondary : COLORS.text,
              }}
            >
              {event.price}
            </div>
          </div>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>À propos</h3>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.7, margin: '0 0 20px' }}>
          {event.description}
        </p>
        <div
          style={{
            padding: 14,
            background: COLORS.bg,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `oklch(0.7 0.12 ${event.hue})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {event.partner[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: COLORS.textLight }}>Partenaire</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{event.partner}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textLight }}>
          👥 {event.attendees.toLocaleString('fr-FR')} personnes intéressées
        </div>
      </div>
      <div
        style={{
          padding: '12px 20px 20px',
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          gap: 10,
        }}
      >
        <a
          href={`https://wa.me/?text=${encodeURIComponent('Tu viens à ' + event.title + ' ?')}`}
          target="_blank"
          rel="noopener"
          style={{
            padding: '14px',
            background: '#25D366',
            color: '#fff',
            borderRadius: 14,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.4 5.2L2 22l4.8-1.4A10 10 0 0012 22c5.5 0 10-4.5 10-10S17.5 2 12 2z"></path>
          </svg>
        </a>
        <button
          onClick={rsvp}
          style={{
            flex: 1,
            padding: '14px',
            background: going ? COLORS.secondary : COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
        >
          {going ? '✓ Tu participes !' : 'Je participe'}
        </button>
      </div>
    </div>
  );
}

// ════ TRANSPORT ════
function TransportScreen({ onBack }) {
  const [cat, setCat] = useState('all');
  const filtered = cat === 'all' ? TRANSPORT : TRANSPORT.filter((p) => p.cat === cat);

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}
    >
      <div
        style={{
          padding: '20px 20px 12px',
          background: '#fff',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
            }}
          >
            <svg
              width="22"
              height="22"
              fill="none"
              stroke={COLORS.text}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Transport & Livraison</h2>
        </div>
        <p style={{ fontSize: 12, color: COLORS.textLight, margin: 0 }}>
          Annuaire des prestataires de confiance
        </p>
        <div
          style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12, paddingBottom: 4 }}
        >
          <button
            onClick={() => setCat('all')}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: 20,
              border: `1.5px solid ${cat === 'all' ? COLORS.primary : COLORS.border}`,
              background: cat === 'all' ? COLORS.primary : '#fff',
              color: cat === 'all' ? '#fff' : COLORS.text,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Tous
          </button>
          {TRANSPORT_CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: 20,
                border: `1.5px solid ${cat === c.id ? COLORS.primary : COLORS.border}`,
                background: cat === c.id ? COLORS.primary : '#fff',
                color: cat === c.id ? '#fff' : COLORS.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p) => {
            const cobj = TRANSPORT_CATS.find((c) => c.id === p.cat);
            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: 14,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, oklch(0.75 0.12 ${p.hue}), oklch(0.55 0.15 ${p.hue + 30}))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {cobj?.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 4 }}>
                    {cobj?.label}
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: COLORS.textLight }}>
                    <span style={{ color: COLORS.accent }}>★ {p.rating}</span>
                    <span>·</span>
                    <span>⏱ {p.time}</span>
                  </div>
                  <div
                    style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600, marginTop: 3 }}
                  >
                    {p.price}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a
                    href={`tel:${p.phone}`}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: COLORS.primary,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.2-3.7-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.1-.6-2.4-.6-3.6 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.4c0-.6-.4-1-1-1z"></path>
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/${p.phone}`}
                    target="_blank"
                    rel="noopener"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#25D366',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    W
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════ ÉCOLES ════
function SchoolsScreen({ onBack, onViewSchool }) {
  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}
    >
      <div
        style={{
          padding: '20px 20px 14px',
          background: '#fff',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
            }}
          >
            <svg
              width="22"
              height="22"
              fill="none"
              stroke={COLORS.text}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Écoles & Universités</h2>
        </div>
        <p style={{ fontSize: 12, color: COLORS.textLight, margin: 0 }}>
          Annuaire des établissements partenaires
        </p>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {SCHOOLS.map((s) => (
            <div
              key={s.id}
              onClick={() => onViewSchool && onViewSchool(s)}
              style={{
                background: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  height: 80,
                  background: `linear-gradient(135deg, oklch(0.72 0.13 ${s.hue}), oklch(0.5 0.16 ${s.hue + 30}))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                {s.name}
              </div>
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.text,
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {s.full}
                </div>
                <div style={{ fontSize: 10.5, color: COLORS.textLight }}>📍 {s.district}</div>
                <div style={{ fontSize: 10.5, color: COLORS.textLight }}>
                  👥 {s.students} étudiants
                </div>
                <div
                  style={{ fontSize: 10.5, color: COLORS.primary, marginTop: 4, fontWeight: 600 }}
                >
                  Voir détails →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════ FAVORITES ════
function FavoritesScreen({ favorites, onViewListing, onToggleFav }) {
  const favListings = LISTINGS.filter((l) => favorites.has(l.id));
  return (
    <div style={{ height: '100%', overflow: 'auto', background: COLORS.bg }}>
      <div style={{ padding: '20px 20px 8px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Favoris</h2>
        <p style={{ fontSize: 13, color: COLORS.textLight, margin: '4px 0 0' }}>
          {favListings.length} logement{favListings.length !== 1 ? 's' : ''} sauvegardé
          {favListings.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div style={{ padding: '12px 20px 100px' }}>
        {favListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textLight }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>❤️</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Aucun favori</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {favListings.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                onTap={onViewListing}
                onFav={onToggleFav}
                isFav={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════ PROFILE ════
function ProfileScreen({ onLogout, persona, onOpenAdmin }) {
  const sections = [
    { label: 'Informations personnelles', icon: '👤' },
    { label: 'Vérification étudiante ✓', icon: '🎓' },
    { label: 'Mes événements', icon: '🎟️' },
    { label: 'Historique réservations', icon: '📋' },
    { label: 'Documents & Contrats', icon: '📄' },
    { label: 'Paramètres', icon: '⚙️' },
    { label: 'Aide & Contact', icon: '💬' },
  ];
  return (
    <div style={{ height: '100%', overflow: 'auto', background: COLORS.bg }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
          padding: '32px 20px 40px',
          textAlign: 'center',
          borderRadius: '0 0 24px 24px',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid rgba(255,255,255,0.4)',
          }}
        >
          <span style={{ fontSize: 28, color: '#fff', fontWeight: 700 }}>A</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Aminata Diallo</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          {persona?.name || 'Étudiante'} · UCAD
        </div>
        <span
          style={{
            display: 'inline-block',
            marginTop: 8,
            fontSize: 11,
            padding: '3px 10px',
            background: COLORS.secondary,
            color: '#fff',
            borderRadius: 20,
            fontWeight: 600,
          }}
        >
          ✓ Identité vérifiée
        </span>
      </div>
      <div style={{ padding: '20px 20px 100px', marginTop: -16 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {sections.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderBottom: i < sections.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{s.label}</span>
              <svg
                width="16"
                height="16"
                fill="none"
                stroke={COLORS.textLight}
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          ))}
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '14px',
            background: 'none',
            border: `1.5px solid ${COLORS.danger}`,
            borderRadius: 14,
            color: COLORS.danger,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Déconnexion
        </button>

        <div
          onClick={onOpenAdmin}
          style={{
            marginTop: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            background: COLORS.text,
            borderRadius: 14,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'rgba(255,255,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            🔒
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Espace admin</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              Réservé aux propriétaires de l'app
            </div>
          </div>
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ListingDetail,
  ReservationScreen,
  NewsScreen,
  EventDetail,
  TransportScreen,
  SchoolsScreen,
  FavoritesScreen,
  ProfileScreen,
});

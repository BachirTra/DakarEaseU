// Screens for Dakar'ease

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ════ ONBOARDING ════
function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: 'Trouve ton logement',
      desc: 'Des centaines de logements vérifiés près de ton université.',
      hue: 220,
      icon: '🔍',
    },
    {
      title: 'Réserve en sécurité',
      desc: 'Paiement sécurisé, zéro arnaque. Chaque annonce vérifiée.',
      hue: 160,
      icon: '🔒',
    },
    {
      title: 'Vis Dakar',
      desc: 'Événements, transport, écoles — tout dans une seule app.',
      hue: 35,
      icon: '✨',
    },
  ];
  const s = slides[step];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `linear-gradient(135deg, oklch(0.82 0.1 ${s.hue}), oklch(0.65 0.14 ${s.hue + 30}))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            transition: 'all 0.4s ease',
          }}
        >
          <span style={{ fontSize: 64 }}>{s.icon}</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: '0 0 12px' }}>
          {s.title}
        </h2>
        <p style={{ fontSize: 15, color: COLORS.textLight, lineHeight: 1.6, margin: 0 }}>
          {s.desc}
        </p>
      </div>
      <div
        style={{
          padding: '0 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? COLORS.primary : COLORS.border,
                transition: 'all 0.3s ease',
              }}
            ></div>
          ))}
        </div>
        <button
          onClick={() => (step < 2 ? setStep(step + 1) : onDone())}
          style={{
            width: '100%',
            padding: '15px',
            background: COLORS.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {step < 2 ? 'Suivant' : 'Commencer'}
        </button>
        {step < 2 && (
          <button
            onClick={onDone}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.textLight,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Passer
          </button>
        )}
      </div>
    </div>
  );
}

// ════ AUTH ════
function AuthScreen({ onDone }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(0); // 0 form, 1 verify-id, 2 success
  const [email, setEmail] = useState('aminata@example.com');
  const [pwd, setPwd] = useState('••••••••');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [hasCard, setHasCard] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const submit = () => {
    if (mode === 'login') {
      onDone();
      return;
    }
    setStep(1);
  };
  const verifyCard = () => {
    setHasCard(true);
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep(2);
    }, 2000);
    setTimeout(onDone, 3500);
  };

  if (step === 2) {
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
          background: '#fff',
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
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: '0 0 8px' }}>
          Identité vérifiée !
        </h2>
        <p style={{ fontSize: 14, color: COLORS.textLight }}>
          Ton statut étudiant est confirmé. Bienvenue {name || "sur Dakar'ease"} 🎉
        </p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '20px 20px 8px' }}>
          <button
            onClick={() => setStep(0)}
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
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: '0 0 6px' }}>
            Vérification étudiante
          </h2>
          <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6 }}>
            Téléverse ta carte étudiante pour débloquer les tarifs étudiants et la vérification
            'Vrai étudiant'.
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={verifyCard}
            style={{
              border: `2px dashed ${hasCard ? COLORS.secondary : COLORS.border}`,
              borderRadius: 16,
              padding: '40px 20px',
              textAlign: 'center',
              background: hasCard ? `${COLORS.secondary}10` : COLORS.bg,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {verifying ? (
              <>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: `3px solid ${COLORS.border}`,
                    borderTopColor: COLORS.primary,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    animation: 'spin 0.8s linear infinite',
                  }}
                ></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ fontSize: 14, color: COLORS.textLight }}>Analyse OCR en cours...</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📇</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  Téléverser ma carte étudiante
                </div>
                <div style={{ fontSize: 12, color: COLORS.textLight }}>
                  JPG, PNG ou PDF · Max 5 Mo
                </div>
              </>
            )}
          </div>
          <button
            onClick={onDone}
            style={{
              marginTop: 16,
              background: 'none',
              border: 'none',
              color: COLORS.textLight,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Faire plus tard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: '0 0 6px' }}>
          {mode === 'login' ? 'Bon retour 👋' : 'Créer ton compte'}
        </h2>
        <p style={{ fontSize: 14, color: COLORS.textLight }}>
          {mode === 'login' ? 'Connecte-toi pour continuer' : "Rejoins la communauté Dakar'ease"}
        </p>
      </div>
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'signup' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom complet"
            style={{
              padding: '14px 16px',
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 12,
              fontSize: 14,
              outline: 'none',
            }}
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            padding: '14px 16px',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 12,
            fontSize: 14,
            outline: 'none',
          }}
        />
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Mot de passe"
          style={{
            padding: '14px 16px',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 12,
            fontSize: 14,
            outline: 'none',
          }}
        />
        {mode === 'signup' && (
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            style={{
              padding: '14px 16px',
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 12,
              fontSize: 14,
              outline: 'none',
              background: '#fff',
              color: school ? COLORS.text : COLORS.textLight,
            }}
          >
            <option value="">École / Université</option>
            {SCHOOLS.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} — {s.full}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={submit}
          style={{
            marginTop: 8,
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
          {mode === 'login' ? 'Se connecter' : 'Continuer'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
          <div style={{ flex: 1, height: 1, background: COLORS.border }}></div>
          <span style={{ fontSize: 12, color: COLORS.textLight }}>OU</span>
          <div style={{ flex: 1, height: 1, background: COLORS.border }}></div>
        </div>
        <button
          style={{
            padding: '13px',
            background: '#fff',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>G</span> Continuer avec Google
        </button>
        <button
          style={{
            padding: '13px',
            background: '#000',
            border: '1.5px solid #000',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.05 12.04c-.03-2.7 2.2-4 2.3-4.06-1.25-1.84-3.2-2.09-3.89-2.12-1.65-.17-3.23.97-4.07.97-.84 0-2.13-.95-3.5-.92-1.8.03-3.46 1.05-4.39 2.66-1.87 3.25-.48 8.06 1.34 10.7.89 1.29 1.95 2.74 3.34 2.69 1.34-.05 1.85-.87 3.47-.87 1.62 0 2.08.87 3.5.84 1.45-.02 2.36-1.31 3.24-2.61 1.02-1.5 1.44-2.95 1.46-3.02-.03-.01-2.8-1.07-2.83-4.27M14.53 4.4c.74-.9 1.24-2.15 1.1-3.4-1.07.04-2.36.71-3.12 1.61-.68.79-1.28 2.06-1.12 3.28 1.19.09 2.41-.6 3.14-1.49" />
          </svg>
          Continuer avec Apple
        </button>
      </div>
      <div
        style={{
          padding: '16px 24px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: COLORS.textLight,
        }}
      >
        {mode === 'login' ? 'Pas de compte ? ' : 'Déjà inscrit ? '}
        <span
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          style={{ color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}
        >
          {mode === 'login' ? "S'inscrire" : 'Se connecter'}
        </span>
      </div>
    </div>
  );
}

// ════ HOME ════
function HomeScreen({
  onViewListing,
  favorites,
  onToggleFav,
  onGoSearch,
  onGoNews,
  onGoCategory,
  onViewSchool,
  onOpenDemande,
  t,
  persona,
}) {
  const topListings = LISTINGS.filter((l) => l.verified).slice(0, 4);
  const partnerSchools = SCHOOLS.slice(0, 6);
  const upcoming = EVENTS.slice(0, 3);

  return (
    <div style={{ height: '100%', overflow: 'auto', background: COLORS.bg }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
          padding: '20px 20px 28px',
          borderRadius: '0 0 24px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
              {persona?.greeting || t.welcome}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Dakar'ease</div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3C7.7 6.2 6 8.4 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1"></path>
            </svg>
          </div>
        </div>
        <div
          onClick={onGoSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 14,
            padding: '12px 16px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            {t.searchPlaceholder}
          </span>
        </div>
      </div>

      <div style={{ padding: '18px 20px 100px' }}>
        {/* Catégories compactes */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            marginBottom: 22,
            paddingBottom: 4,
          }}
        >
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onGoCategory(cat.id)}
              style={{
                flexShrink: 0,
                background: '#fff',
                borderRadius: 14,
                padding: '12px 14px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                minWidth: 72,
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 5 }}>{cat.icon}</div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: COLORS.text,
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ★ LOGEMENTS PARTENAIRES — mis en avant en haut */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: COLORS.text,
                margin: 0,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              🏠 Logements partenaires
            </h3>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 3 }}>
              Vérifiés près de ton université
            </div>
          </div>
          <span
            onClick={onGoSearch}
            style={{
              fontSize: 13,
              color: COLORS.primary,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t.viewAll}
          </span>
        </div>
        <div
          onClick={onOpenDemande}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
            borderRadius: 16,
            padding: '14px 16px',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            🎯
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Trouve ton logement idéal
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)' }}>
              Réponds à 4 questions, on s'occupe du reste
            </div>
          </div>
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollSnapType: 'x mandatory',
            marginBottom: 28,
          }}
        >
          {topListings.map((l) => (
            <div
              key={l.id}
              style={{ minWidth: 215, maxWidth: 215, scrollSnapAlign: 'start', flexShrink: 0 }}
            >
              <ListingCard
                listing={l}
                onTap={onViewListing}
                onFav={onToggleFav}
                isFav={favorites.has(l.id)}
              />
            </div>
          ))}
        </div>

        {/* ★ ÉCOLES PARTENAIRES — mis en avant en haut */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: COLORS.text,
                margin: 0,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              🎓 Écoles partenaires
            </h3>
            <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 3 }}>
              Universités & instituts du réseau
            </div>
          </div>
          <span
            onClick={() => onGoCategory('ecoles')}
            style={{
              fontSize: 13,
              color: COLORS.primary,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {t.viewAll}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollSnapType: 'x mandatory',
            marginBottom: 28,
          }}
        >
          {partnerSchools.map((s) => (
            <div
              key={s.id}
              onClick={() => onViewSchool && onViewSchool(s)}
              style={{
                minWidth: 150,
                maxWidth: 150,
                scrollSnapAlign: 'start',
                flexShrink: 0,
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  height: 76,
                  background: `linear-gradient(135deg, oklch(0.6 0.16 ${s.hue}), oklch(0.42 0.18 ${s.hue + 30}))`,
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
              <div style={{ padding: '10px 12px 12px' }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: COLORS.text,
                    lineHeight: 1.3,
                    marginBottom: 4,
                    minHeight: 30,
                  }}
                >
                  {s.full}
                </div>
                <div style={{ fontSize: 10, color: COLORS.textLight }}>📍 {s.district}</div>
                <div style={{ fontSize: 10, color: COLORS.primary, fontWeight: 600, marginTop: 5 }}>
                  {(s.logements || []).length} logement{(s.logements || []).length !== 1 ? 's' : ''}{' '}
                  proche{(s.logements || []).length !== 1 ? 's' : ''} →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Événements */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, margin: 0 }}>
            {t.upcoming}
          </h3>
          <span
            onClick={onGoNews}
            style={{ fontSize: 13, color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}
          >
            {t.viewAll}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollSnapType: 'x mandatory',
            marginBottom: 28,
          }}
        >
          {upcoming.map((ev) => (
            <div
              key={ev.id}
              onClick={onGoNews}
              style={{
                minWidth: 220,
                scrollSnapAlign: 'start',
                background: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  height: 100,
                  background: `linear-gradient(135deg, oklch(0.7 0.13 ${ev.hue}), oklch(0.5 0.16 ${ev.hue + 30}))`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#fff',
                    background: 'rgba(0,0,0,0.35)',
                    padding: '3px 8px',
                    borderRadius: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {ev.cat}
                </span>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                  {ev.title}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textLight }}>
                  {ev.date} · {ev.venue}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Restaurants */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, margin: 0 }}>
            🍽️ Restaurants proches
          </h3>
          <span
            onClick={() => onGoCategory('restaurants')}
            style={{ fontSize: 13, color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}
          >
            {t.viewAll}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollSnapType: 'x mandatory',
          }}
        >
          {RESTAURANTS.slice(0, 4).map((r) => (
            <div
              key={r.id}
              onClick={() => onGoCategory('restaurants')}
              style={{
                minWidth: 160,
                scrollSnapAlign: 'start',
                background: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <PlaceholderImg hue={r.hue} height={90} icon="🍽️" style={{ width: '100%' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 10.5, color: COLORS.textLight, marginBottom: 4 }}>
                  {r.type} · {r.district}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10.5,
                    color: COLORS.text,
                  }}
                >
                  <span style={{ color: '#F59E0B' }}>★</span>
                  {r.rating}
                  {r.hasDelivery && (
                    <span style={{ marginLeft: 4, color: COLORS.secondary }}>🛵</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════ SEARCH ════
function SearchScreen({ onViewListing, favorites, onToggleFav, onOpenDemande }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState(300000);
  const [selectedType, setSelectedType] = useState('all');
  const types = ['all', 'Studio', 'Chambre', 'Appartement'];
  const typeLabels = { all: 'Tous', Studio: 'Studio', Chambre: 'Chambre', Appartement: 'Appart.' };

  const filtered = useMemo(
    () =>
      LISTINGS.filter((l) => {
        if (
          query &&
          !l.title.toLowerCase().includes(query.toLowerCase()) &&
          !l.district.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        if (l.price > priceRange) return false;
        if (selectedType !== 'all' && l.type !== selectedType) return false;
        return true;
      }),
    [query, priceRange, selectedType],
  );

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: COLORS.bg }}
    >
      <div
        style={{
          padding: '16px 20px 12px',
          background: '#fff',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: COLORS.bg,
            borderRadius: 12,
            padding: '10px 14px',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke={COLORS.textLight}
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quartier, type de logement..."
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              fontSize: 14,
              color: COLORS.text,
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? COLORS.primary : 'none',
              border: `1.5px solid ${showFilters ? COLORS.primary : COLORS.border}`,
              borderRadius: 10,
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke={showFilters ? '#fff' : COLORS.textLight}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 4h18M3 12h18M3 20h18"></path>
            </svg>
          </button>
        </div>
        <div
          onClick={onOpenDemande}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 10,
            padding: '10px 14px',
            background: `${COLORS.primary}0d`,
            border: `1px solid ${COLORS.primary}22`,
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 18 }}>🎯</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.text }}>
              Recherche guidée
            </div>
            <div style={{ fontSize: 10.5, color: COLORS.textLight }}>
              On trouve le logement qui matche tes critères
            </div>
          </div>
          <svg
            width="16"
            height="16"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
        <div
          style={{
            maxHeight: showFilters ? 200 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease',
          }}
        >
          <div style={{ padding: '14px 0 4px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {types.map((tp) => (
                <button
                  key={tp}
                  onClick={() => setSelectedType(tp)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    border: `1.5px solid ${selectedType === tp ? COLORS.primary : COLORS.border}`,
                    background: selectedType === tp ? COLORS.primary : '#fff',
                    color: selectedType === tp ? '#fff' : COLORS.text,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {typeLabels[tp]}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 6 }}>
              Budget max :{' '}
              <strong style={{ color: COLORS.text }}>
                {priceRange.toLocaleString('fr-FR')} CFA
              </strong>
            </div>
            <input
              type="range"
              min={50000}
              max={400000}
              step={10000}
              value={priceRange}
              onChange={(e) => setPriceRange(+e.target.value)}
              style={{ width: '100%', accentColor: COLORS.primary }}
            />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 100px' }}>
        <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 12 }}>
          {filtered.length} logement{filtered.length > 1 ? 's' : ''} trouvé
          {filtered.length > 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((l) => (
            <div
              key={l.id}
              onClick={() => onViewListing(l)}
              style={{
                display: 'flex',
                background: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              <PlaceholderImg
                hue={200 + l.id * 25}
                height={120}
                icon="🏠"
                style={{ width: 120, flexShrink: 0, height: 'auto', minHeight: 120 }}
              />
              <div
                style={{
                  padding: '12px 14px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}
                >
                  {l.title}
                </span>
                {l.verified && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      color: COLORS.secondary,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                    </svg>
                    Vérifié
                  </div>
                )}
                <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 6 }}>
                  {l.district} · {l.area} m² · {l.type}
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary }}>
                    {l.price.toLocaleString('fr-FR')}{' '}
                    <span style={{ fontSize: 11, fontWeight: 400, color: COLORS.textLight }}>
                      CFA/mois
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: COLORS.accent }}>★ {l.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, AuthScreen, HomeScreen, SearchScreen });

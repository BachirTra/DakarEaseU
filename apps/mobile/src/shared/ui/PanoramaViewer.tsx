import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// ─── Viewer standard (JPG/PNG/WEBP) ─────────────────────────────────────────
// PSV v4 + Three.js r146. Image pré-téléchargée → data URL → pas de CORS WebGL.
// Le listener panorama-error est supprimé : il déclenchait de faux échecs sur
// data: URLs alors que Three.js rendait le panorama correctement.
//
// L'abonnement au 'ready' est fait via l'API d'événements uEvent de PSV v4
// (`viewer.once(...)`). `addEventListener` n'existe QUE sur PSV v5 : l'appeler
// sur un Viewer v4 lançait un TypeError capturé → post('error') immédiat, d'où
// le « Impossible de charger » alors même que l'image était bien téléchargée.
// On détecte l'API disponible pour rester compatible v4 comme v5.
function buildHtmlPsv(b64: string, mime: string): string {
  const dataUrl = `data:${mime};base64,${b64}`.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photo-sphere-viewer@4/dist/photo-sphere-viewer.min.css" />
<style>
  html, body, #viewer { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
</style>
</head>
<body>
<div id="viewer"></div>
<script src="https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/uevent@2/browser.js"></script>
<script src="https://cdn.jsdelivr.net/npm/photo-sphere-viewer@4/dist/photo-sphere-viewer.min.js"></script>
<script>
  function post(msg) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg); }
  window.addEventListener('load', function() {
    try {
      if (typeof PhotoSphereViewer === 'undefined') { post('error:psv-not-loaded'); return; }
      var viewer = new PhotoSphereViewer.Viewer({
        container: document.getElementById('viewer'),
        panorama: '${dataUrl}',
        navbar: false, defaultZoomLvl: 0, mousewheel: false, touchmoveTwoFingers: false,
        loadingTxt: '',
      });
      if (typeof viewer.once === 'function') {
        viewer.once('ready', function() { post('ready'); });
      } else if (typeof viewer.addEventListener === 'function') {
        viewer.addEventListener('ready', function() { post('ready'); }, { once: true });
      } else {
        post('ready');
      }
    } catch(e) { post('error:init-' + ((e && e.message) || '')); }
  });
</script>
</body>
</html>`;
}

// ─── Viewer HDR (RGBE / .hdr) ────────────────────────────────────────────────
// Three.js r132.0 — dernière version avec examples/js UMD (RGBELoader en global).
//
// Chargement en deux phases pour éviter les limites de taille HTML :
//   1. WebView charge Three.js depuis CDN, puis envoie 'ready-for-b64'
//   2. React Native injecte le base64 via injectJavaScript → window.startHDR()
//
// Fix critique : loader.parse() retourne un objet brut { data, width, height, … }
// pas un DataTexture. On construit new THREE.DataTexture() manuellement.
function buildHtmlHdr(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;" />
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
  canvas { display: block; }
</style>
</head>
<body>
<script src="https://cdn.jsdelivr.net/npm/three@0.132.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.132.0/examples/js/loaders/RGBELoader.js"></script>
<script>
  function post(msg) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg); }

  var scene, camera, renderer;

  window.addEventListener('load', function() {
    try {
      if (typeof THREE === 'undefined') { post('error:three-not-loaded'); return; }
      if (typeof THREE.RGBELoader === 'undefined') { post('error:rgbe-not-loaded'); return; }

      var W = window.innerWidth, H = window.innerHeight;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(W, H);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.outputEncoding = THREE.sRGBEncoding;
      document.body.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 2000);

      var lon = 0, lat = 0, startX = 0, startY = 0, dragging = false;
      var el = renderer.domElement;
      el.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) { dragging = true; startX = e.touches[0].clientX; startY = e.touches[0].clientY; }
      }, { passive: true });
      el.addEventListener('touchmove', function(e) {
        if (!dragging || e.touches.length !== 1) return;
        lon -= (e.touches[0].clientX - startX) * 0.25;
        lat += (e.touches[0].clientY - startY) * 0.15;
        lat = Math.max(-85, Math.min(85, lat));
        startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      }, { passive: true });
      el.addEventListener('touchend', function() { dragging = false; });

      function animate() {
        requestAnimationFrame(animate);
        var phi = THREE.MathUtils.degToRad(90 - lat);
        var theta = THREE.MathUtils.degToRad(lon);
        camera.lookAt(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        );
        renderer.render(scene, camera);
      }
      animate();

      // Signale à React Native que Three.js est prêt à recevoir les données HDR
      post('ready-for-b64');

    } catch(e) { post('error:init-' + ((e && e.message) || 'init')); }
  });

  // Appelée par React Native via injectJavaScript une fois le fichier téléchargé
  window.startHDR = function(b64) {
    try {
      var binary = atob(b64);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }

      var loader = new THREE.RGBELoader();
      loader.setDataType(THREE.HalfFloatType);

      // parse() retourne { data, width, height, format, type } — pas un DataTexture
      var texData = loader.parse(bytes.buffer);
      if (!texData || !texData.data) { post('error:hdr-parse-empty'); return; }

      var texture = new THREE.DataTexture(
        texData.data,
        texData.width,
        texData.height,
        texData.format || THREE.RGBAFormat,
        texData.type || THREE.HalfFloatType
      );
      texture.mapping = THREE.UVMapping;
      texture.needsUpdate = true;

      var geo = new THREE.SphereGeometry(1000, 60, 40);
      geo.scale(-1, 1, 1);
      var mat = new THREE.MeshBasicMaterial({ map: texture });
      scene.add(new THREE.Mesh(geo, mat));

      post('ready');
    } catch(e) { post('error:hdr-' + ((e && e.message) || 'proc')); }
  };
</script>
</body>
</html>`;
}

// ─── Fetch & cache ───────────────────────────────────────────────────────────
async function fetchAsBase64(remoteUrl: string): Promise<{ b64: string; mime: string }> {
  const ext = (remoteUrl.split('.').pop()?.split('?')[0] ?? 'jpg').toLowerCase();
  const mime =
    ext === 'hdr'
      ? 'image/vnd.radiance'
      : ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

  const cacheKey = remoteUrl.replace(/[^a-zA-Z0-9]/g, '_').slice(-80);
  const localUri = `${FileSystem.cacheDirectory}pano_${cacheKey}.${ext}`;

  const info = await FileSystem.getInfoAsync(localUri);
  if (!info.exists) {
    await FileSystem.downloadAsync(remoteUrl, localUri);
  }

  const b64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { b64, mime };
}

// ─── Composant ───────────────────────────────────────────────────────────────
type ViewerState = 'fetching' | 'loading' | 'ready' | 'error';

interface PanoramaViewerProps {
  url: string;
  isHdr?: boolean;
}

export function PanoramaViewer({ url, isHdr = false }: PanoramaViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const [b64Data, setB64Data] = useState<{ b64: string; mime: string } | null>(null);
  const [state, setState] = useState<ViewerState>('fetching');

  useEffect(() => {
    setState('fetching');
    setB64Data(null);
    fetchAsBase64(url)
      .then((data) => {
        setB64Data(data);
        setState('loading');
      })
      .catch(() => setState((s) => (s === 'ready' ? 'ready' : 'error')));
  }, [url]);

  // HDR : la WebView se crée dès que b64Data arrive (CDN charge en parallèle
  // avec le téléchargement de l'image). Pour JPG, b64Data est embarqué dans le HTML.
  const html = useMemo(() => {
    if (!b64Data) return '';
    return isHdr ? buildHtmlHdr() : buildHtmlPsv(b64Data.b64, b64Data.mime);
  }, [b64Data, isHdr]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {b64Data ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://cdn.jsdelivr.net' }}
          style={{ flex: 1, backgroundColor: '#000' }}
          scrollEnabled={false}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          androidLayerType="hardware"
          mixedContentMode="always"
          allowFileAccess
          allowUniversalAccessFromFileURLs
          onMessage={(event) => {
            const data = event.nativeEvent.data;
            if (data === 'ready') {
              setState('ready');
            } else if (data === 'ready-for-b64') {
              // Phase 2 HDR : injecter le base64 maintenant que Three.js est prêt
              // b64Data est toujours disponible ici (WebView ne s'affiche qu'après)
              if (b64Data) {
                webViewRef.current?.injectJavaScript(
                  `window.startHDR(${JSON.stringify(b64Data.b64)}); true;`,
                );
              }
            } else if (data.startsWith('error')) {
              // State ratchet : une fois 'ready', on n'en sort plus.
              // Évite que panorama-error (PSV) ou toute autre erreur tardive
              // n'écrase un état 'ready' déjà établi.
              setState((s) => (s === 'ready' ? 'ready' : 'error'));
            }
          }}
          onError={() => setState((s) => (s === 'ready' ? 'ready' : 'error'))}
          onLoadEnd={() => {
            // Fallback : si le viewer n'envoie jamais 'ready' dans les 20s
            setTimeout(() => setState((s) => (s === 'loading' ? 'error' : s)), 20000);
          }}
        />
      ) : null}

      {state === 'fetching' || state === 'loading' ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text style={{ color: '#FFFFFF99', marginTop: 12, fontSize: 13 }}>
            {state === 'fetching'
              ? isHdr
                ? 'Téléchargement HDR…'
                : 'Téléchargement…'
              : 'Chargement de la visite…'}
          </Text>
        </View>
      ) : null}

      {state === 'error' ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, textAlign: 'center', fontWeight: '600' }}>
            Impossible de charger la visite 360°
          </Text>
          <Text style={{ color: '#FFFFFF99', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
            Vérifiez votre connexion internet et réessayez.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

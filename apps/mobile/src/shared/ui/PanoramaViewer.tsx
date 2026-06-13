import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Rend une photo-sphère équirectangulaire 360° (JPG) via Photo Sphere Viewer
 * (licence MIT, gratuit) chargé en UMD depuis un CDN dans une WebView.
 *
 * On utilise PSV v4 (builds UMD globaux, pas d'importmap) pour rester
 * compatible avec les WebView plus anciennes. Navigation tactile : drag.
 */
function buildHtml(panoramaUrl: string): string {
  // Échappe les apostrophes/quotes de l'URL pour l'injection JS.
  const safeUrl = panoramaUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
  }
  try {
    var viewer = new PhotoSphereViewer.Viewer({
      container: document.getElementById('viewer'),
      panorama: '${safeUrl}',
      navbar: false,
      defaultZoomLvl: 0,
      mousewheel: false,
      touchmoveTwoFingers: false,
      loadingTxt: 'Chargement…',
    });
    viewer.addEventListener('ready', function () { post('ready'); }, { once: true });
    viewer.addEventListener('panorama-error', function () { post('error'); });
  } catch (e) {
    post('error');
  }
</script>
</body>
</html>`;
}

interface PanoramaViewerProps {
  url: string;
}

export function PanoramaViewer({ url }: PanoramaViewerProps) {
  const html = useMemo(() => buildHtml(url), [url]);
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1, backgroundColor: '#000' }}
        scrollEnabled={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          if (event.nativeEvent.data === 'ready') setLoading(false);
        }}
        onLoadEnd={() => {
          // Filet de sécurité si l'évènement "ready" n'arrive pas.
          setTimeout(() => setLoading(false), 4000);
        }}
      />
      {loading ? (
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
        </View>
      ) : null}
    </View>
  );
}

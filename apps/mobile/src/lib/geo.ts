import { Linking, Platform } from 'react-native';

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function openMapsDirections(lat: number, lng: number, label?: string): void {
  const encodedLabel = label ? encodeURIComponent(label) : '';
  const url =
    Platform.OS === 'ios'
      ? `maps:?daddr=${lat},${lng}${encodedLabel ? `(${encodedLabel})` : ''}`
      : `geo:${lat},${lng}?q=${lat},${lng}${encodedLabel ? `(${encodedLabel})` : ''}`;

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      // Fallback to Google Maps web
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      );
    }
  });
}

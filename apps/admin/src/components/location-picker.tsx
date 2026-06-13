'use client';

import dynamic from 'next/dynamic';
import type { LocationPickerMapProps } from './location-picker-map';

const LocationPickerMap = dynamic(
  () => import('./location-picker-map').then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 350 }}
        className="animate-pulse rounded-lg border border-border bg-muted"
      />
    ),
  },
);

export function LocationPicker(props: LocationPickerMapProps) {
  return <LocationPickerMap {...props} />;
}

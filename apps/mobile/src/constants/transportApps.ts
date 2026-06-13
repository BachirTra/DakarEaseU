import { Linking, Platform } from 'react-native';

export type TransportAppCategory = 'taxi' | 'moto' | 'livraison';

export const TRANSPORT_CATEGORIES: TransportAppCategory[] = ['taxi', 'moto', 'livraison'];

export interface TransportApp {
  id: string;
  name: string;
  tagline: string;
  /**
   * Logo de marque. URL distante (Clearbit Logo API, gratuit) pour un rendu
   * immédiat. Pour la PROD, déposez les logos officiels dans
   * `assets/transport/<id>.png` et remplacez par `require('../../assets/...')`.
   */
  logoUrl: string;
  categories: TransportAppCategory[];
  /** Deep link pour ouvrir l'app si installée. À VÉRIFIER avant prod. */
  scheme: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
}

export const TRANSPORT_APPS: TransportApp[] = [
  {
    id: 'yango',
    name: 'Yango',
    tagline: 'Courses en voiture, moto et livraison',
    logoUrl: 'https://logo.clearbit.com/yango.com',
    categories: ['taxi', 'moto', 'livraison'],
    scheme: 'yango://',
    iosStoreUrl: 'https://apps.apple.com/app/id1437157286',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.yandex.yango',
  },
  {
    id: 'heetch',
    name: 'Heetch',
    tagline: 'VTC et moto à Dakar',
    logoUrl: 'https://logo.clearbit.com/heetch.com',
    categories: ['taxi', 'moto'],
    scheme: 'heetch://',
    iosStoreUrl: 'https://apps.apple.com/app/id691433683',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.heetch',
  },
  {
    id: 'bolt',
    name: 'Bolt',
    tagline: 'Courses VTC rapides',
    logoUrl: 'https://logo.clearbit.com/bolt.eu',
    categories: ['taxi'],
    scheme: 'bolt://',
    iosStoreUrl: 'https://apps.apple.com/app/id675033630',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=ee.mtakso.client',
  },
  {
    id: 'yassir',
    name: 'Yassir',
    tagline: 'VTC et livraison',
    logoUrl: 'https://logo.clearbit.com/yassir.com',
    categories: ['taxi', 'livraison'],
    scheme: 'yassir://',
    iosStoreUrl: 'https://apps.apple.com/app/id1392651928',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.yassir.client',
  },
];

/**
 * Ouvre l'app de mobilité si elle est installée, sinon redirige vers le store
 * de la plateforme. On tente directement `openURL(scheme)` : si aucune app ne
 * gère le scheme, la promesse est rejetée → on bascule sur le store.
 * (Pattern robuste qui évite les limitations de `canOpenURL` sur Android 11+
 * et `LSApplicationQueriesSchemes` sur iOS.)
 */
export async function openTransportApp(app: TransportApp): Promise<void> {
  const store = Platform.OS === 'ios' ? app.iosStoreUrl : app.androidStoreUrl;
  try {
    await Linking.openURL(app.scheme);
  } catch {
    await Linking.openURL(store);
  }
}

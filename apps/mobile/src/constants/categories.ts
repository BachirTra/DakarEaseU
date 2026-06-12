export type CategoryId = 'logements' | 'ecoles' | 'restaurants' | 'transport';

export interface Category {
  id: CategoryId;
  labelKey: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'logements', labelKey: 'categories.logements', icon: '🏠' },
  { id: 'ecoles', labelKey: 'categories.ecoles', icon: '🎓' },
  { id: 'restaurants', labelKey: 'categories.restaurants', icon: '🍽️' },
  { id: 'transport', labelKey: 'categories.transport', icon: '🚖' },
];

export type TransportCategoryId = 'taxi' | 'moto' | 'repas' | 'colis' | 'demenagement' | 'location';

export interface TransportCategory {
  id: TransportCategoryId;
  labelKey: string;
  icon: string;
}

export const TRANSPORT_CATEGORIES: TransportCategory[] = [
  { id: 'taxi', labelKey: 'transport.cat.taxi', icon: '🚖' },
  { id: 'moto', labelKey: 'transport.cat.moto', icon: '🏍️' },
  { id: 'repas', labelKey: 'transport.cat.repas', icon: '🍱' },
  { id: 'colis', labelKey: 'transport.cat.colis', icon: '📦' },
  { id: 'demenagement', labelKey: 'transport.cat.demenagement', icon: '🚚' },
  { id: 'location', labelKey: 'transport.cat.location', icon: '🚗' },
];

export const DISTRICTS = [
  'Plateau',
  'Médina',
  'Point E',
  'Mermoz',
  'Sacré-Cœur',
  'Ouakam',
  'Ngor',
  'Almadies',
  'Liberté 6',
  'Yoff',
  'Fann',
  'HLM',
] as const;

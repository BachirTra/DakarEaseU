import type { IconName } from '@/shared/ui/Icon';

export type CategoryId = 'logements' | 'ecoles' | 'restaurants' | 'transport';

export interface Category {
  id: CategoryId;
  labelKey: string;
  iconName: IconName;
}

export const CATEGORIES: Category[] = [
  { id: 'logements', labelKey: 'categories.logements', iconName: 'home' },
  { id: 'ecoles', labelKey: 'categories.ecoles', iconName: 'graduation-cap' },
  { id: 'restaurants', labelKey: 'categories.restaurants', iconName: 'utensils' },
  { id: 'transport', labelKey: 'categories.transport', iconName: 'car' },
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

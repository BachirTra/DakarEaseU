import Svg, { Path } from 'react-native-svg';

export type TabIconName = 'home' | 'search' | 'news' | 'favorites' | 'profile';

const PATHS: Record<TabIconName, string> = {
  home: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5H10v5a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z',
  search:
    'M11 4a7 7 0 104.95 11.95l4.55 4.55 1.41-1.41-4.55-4.55A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z',
  news: 'M4 4h13a2 2 0 012 2v13a1 1 0 01-1 1H6a2 2 0 01-2-2V4zm2 4h9M6 11h9M6 14h6',
  favorites:
    'M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c1.9 0 3.4 1 4.5 2.4C12.1 6 13.6 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z',
  profile: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM4 21c0-3.6 3.6-6 8-6s8 2.4 8 6',
};

interface BottomTabIconProps {
  name: TabIconName;
  color: string;
  size?: number;
}

export function BottomTabIcon({ name, color, size = 24 }: BottomTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={PATHS[name]}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

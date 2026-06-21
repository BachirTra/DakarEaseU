import Svg, { Circle, Path } from 'react-native-svg';

export type IconName =
  | 'search'
  | 'home'
  | 'graduation-cap'
  | 'utensils'
  | 'car'
  | 'heart'
  | 'heart-filled'
  | 'star'
  | 'star-filled'
  | 'map-pin'
  | 'bell'
  | 'newspaper'
  | 'party'
  | 'check'
  | 'check-circle'
  | 'close'
  | 'package';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = '#1E3A8A' }: IconProps) {
  const s = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  function renderIcon() {
    switch (name) {
      case 'search':
        return (
          <>
            <Circle cx={11} cy={11} r={8} {...s} />
            <Path d="m21 21-4.34-4.34" {...s} />
          </>
        );
      case 'home':
        return (
          <>
            <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" {...s} />
            <Path
              d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              {...s}
            />
          </>
        );
      case 'graduation-cap':
        return (
          <>
            <Path
              d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
              {...s}
            />
            <Path d="M22 10v6" {...s} />
            <Path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" {...s} />
          </>
        );
      case 'utensils':
        return (
          <>
            <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" {...s} />
            <Path d="M7 2v20" {...s} />
            <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" {...s} />
          </>
        );
      case 'car':
        return (
          <>
            <Path d="M19 17H5a2 2 0 0 1-2-2V9l2-4h14l2 4v6a2 2 0 0 1-2 2z" {...s} />
            <Path d="M3 9h18" {...s} />
            <Circle cx={8} cy={17} r={2} {...s} />
            <Circle cx={16} cy={17} r={2} {...s} />
          </>
        );
      case 'heart':
        return (
          <Path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            {...s}
          />
        );
      case 'heart-filled':
        return (
          <Path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            fill={color}
            stroke="none"
          />
        );
      case 'star':
        return (
          <Path
            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
            {...s}
          />
        );
      case 'star-filled':
        return (
          <Path
            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
            fill={color}
            stroke="none"
          />
        );
      case 'map-pin':
        return (
          <>
            <Path
              d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
              {...s}
            />
            <Circle cx={12} cy={10} r={3} {...s} />
          </>
        );
      case 'bell':
        return (
          <>
            <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" {...s} />
            <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" {...s} />
          </>
        );
      case 'newspaper':
        return (
          <>
            <Path
              d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
              {...s}
            />
            <Path d="M18 14h-8" {...s} />
            <Path d="M15 18h-5" {...s} />
            <Path d="M10 6h8v4h-8z" {...s} />
          </>
        );
      case 'party':
        return (
          <>
            <Path d="M5.8 11.3 2 22l10.7-3.79" {...s} />
            <Path d="M4 3h.01" {...s} />
            <Path d="M22 8h.01" {...s} />
            <Path d="M15 2h.01" {...s} />
            <Path d="M22 20h.01" {...s} />
            <Path
              d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"
              {...s}
            />
            <Path
              d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"
              {...s}
            />
            <Path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" {...s} />
          </>
        );
      case 'check':
        return <Path d="M20 6 9 17 4 12" {...s} />;
      case 'check-circle':
        return (
          <>
            <Circle cx={12} cy={12} r={10} {...s} />
            <Path d="m9 12 2 2 4-4" {...s} />
          </>
        );
      case 'close':
        return (
          <>
            <Path d="M18 6 6 18" {...s} />
            <Path d="m6 6 12 12" {...s} />
          </>
        );
      case 'package':
        return (
          <>
            <Path d="m7.5 4.27 9 5.15" {...s} />
            <Path
              d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
              {...s}
            />
            <Path d="m3.3 7 8.7 5 8.7-5" {...s} />
            <Path d="M12 22V12" {...s} />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderIcon()}
    </Svg>
  );
}

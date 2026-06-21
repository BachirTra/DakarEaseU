import { useLocalSearchParams } from 'expo-router';
import { PackDetailScreen } from '@/features/packs/screens/PackDetailScreen';

export default function PackDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PackDetailScreen id={id} />;
}

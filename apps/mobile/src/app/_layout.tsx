import '../../global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from '@/providers/AppProviders';
import { MediaViewerOverlay } from '@/shared/ui/MediaViewerOverlay';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <StatusBar style="dark" />
          <Slot />
          <MediaViewerOverlay />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

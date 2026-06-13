import { create } from 'zustand';
import type { MediaKind } from '@/shared/ui/MediaViewerOverlay';

interface UiState {
  activeMediaViewer: { uri: string; kind: MediaKind; title?: string } | null;
  openMediaViewer: (uri: string, kind: MediaKind, title?: string) => void;
  closeMediaViewer: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeMediaViewer: null,
  openMediaViewer: (uri, kind, title) => set({ activeMediaViewer: { uri, kind, title } }),
  closeMediaViewer: () => set({ activeMediaViewer: null }),
}));

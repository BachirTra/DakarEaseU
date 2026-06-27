import { create } from 'zustand';
import type { MediaKind } from '@/shared/ui/MediaViewerOverlay';

interface UiState {
  activeMediaViewer: { uri: string; kind: MediaKind; title?: string; isHdr?: boolean } | null;
  openMediaViewer: (uri: string, kind: MediaKind, title?: string, isHdr?: boolean) => void;
  closeMediaViewer: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeMediaViewer: null,
  openMediaViewer: (uri, kind, title, isHdr) =>
    set({ activeMediaViewer: { uri, kind, title, isHdr } }),
  closeMediaViewer: () => set({ activeMediaViewer: null }),
}));

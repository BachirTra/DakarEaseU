import { create } from "zustand";

interface UiState {
  activeMediaViewer: { uri: string; kind: "photo" | "video" | "tour_3d" } | null;
  openMediaViewer: (uri: string, kind: "photo" | "video" | "tour_3d") => void;
  closeMediaViewer: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeMediaViewer: null,
  openMediaViewer: (uri, kind) => set({ activeMediaViewer: { uri, kind } }),
  closeMediaViewer: () => set({ activeMediaViewer: null }),
}));

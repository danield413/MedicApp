import { create } from 'zustand';

// Definimos la forma del store
interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Creamos el store
export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true, // Por defecto, el sidebar estará abierto
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
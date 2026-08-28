import { defineStore } from "pinia";
import config from '@/config'

const DARK_THEME = 'DARK_AQUA_THEME'

function getDefaultTheme(): string {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? DARK_THEME : config.actTheme
}

export const useCustomizerStore = defineStore("customizer",{
  persist: {
    storage: localStorage,
    paths: ['actTheme', 'mini_sidebar']
  },
  state: () => ({
    Sidebar_drawer: config.Sidebar_drawer,
    Customizer_drawer: config.Customizer_drawer,
    mini_sidebar: config.mini_sidebar,
    setHorizontalLayout: config.setHorizontalLayout, // Horizontal layout
    actTheme: getDefaultTheme(),
    boxed: config.boxed,
    setBorderCard: config.setBorderCard
  }),

  getters: {},
  actions: {
    SET_SIDEBAR_DRAWER() {
      this.Sidebar_drawer = !this.Sidebar_drawer;
    },
    SET_MINI_SIDEBAR(payload: any) {
      this.mini_sidebar = payload;
    },
    SET_CUSTOMIZER_DRAWER(payload: any) {
      this.Customizer_drawer = payload;
    },

    SET_LAYOUT(payload: any) {
      this.setHorizontalLayout = payload;
    },
    SET_THEME(payload: any) {
      this.actTheme = payload;
    },
    SET_CARD_BORDER(payload: any){
      this.setBorderCard = payload
    }
  },
});

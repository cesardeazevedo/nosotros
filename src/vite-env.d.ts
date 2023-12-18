/// <reference types="vite/client" />
import '@mui/material'

declare global {
  interface Window {
    __WB_MANIFEST: never
  }
}

declare module '@mui/material' {
  interface Palette {
    dividerSolid: string
  }
  // allow configuration using `createTheme`
  interface PaletteOptions {
    dividerSolid: string
  }
}

declare module '@storybook/types' {
  export interface Globals {
    store: RootStore
  }
}

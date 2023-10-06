/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />
import '@mui/material/styles'
import { RootStore } from 'stores/root.store'

// "Typescript Gymnastics"

declare module '@nichoth/identicon' {
  export class Identicon {
    constructor(hash: string)
  }
}

declare global {
  interface Window {
    __WB_MANIFEST: never
  }
}

declare module '@mui/material/styles' {
  interface Palette {
    dividerSolid: string
  }
  // allow configuration using `createTheme`
  interface PaletteOptions {
    dividerSolid: string
  }
}

declare module 'vitest' {
  export interface TestContext {
    root: RootStore
  }
}

declare module '@storybook/types' {
  export interface Globals {
    store: RootStore
  }
}

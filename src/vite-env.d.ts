/// <reference types="vite/client" />
/// <reference types="unplugin-info/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'eslint-plugin-react'

declare global {
  interface Window {
    __WB_MANIFEST: never
  }
}

declare module '@storybook/types' {
  export interface Globals {
    store: RootStore
  }
}

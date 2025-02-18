import { DEFAULT_RELAYS } from '@/constants/relays'
import { defaultNostrSettings } from '@/nostr/settings'
import type { RootStoreSnapshotIn } from '../root.store'

export const initialState: RootStoreSnapshotIn = {
  auth: {},
  decks: {
    selected: 'root',
    decks: {
      root: {
        id: 'root',
        columns: [],
        modules: {},
      },
    },
  },
  globalSettings: {
    lang: 'en',
    theme: 'auto',
    clientTag: true,
    scroll: {
      reposts: true,
      reactions: true,
      zaps: true,
      replies: true,
    },
  },
  nostrSettings: {
    ...defaultNostrSettings,
  },
  defaultContext: {
    relays: DEFAULT_RELAYS,
  },
  tempModules: {},
  persistedModules: {},
}

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
  },
  nostrSettings: {
    ...defaultNostrSettings,
    scroll: {
      reposts: true,
      reactions: true,
      zaps: true,
      replies: true,
    },
  },
  defaultContext: {
    settings: {
      ...defaultNostrSettings,
      localDB: false,
      scroll: {
        reposts: true,
        reactions: true,
        zaps: true,
        replies: true,
      },
    },
    options: {
      relays: DEFAULT_RELAYS,
    },
  },
  tempModules: {},
  persistedModules: {},
}

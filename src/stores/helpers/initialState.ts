import { DEFAULT_RELAYS } from '@/constants/relays'
import { defaultNostrSettings } from '@/nostr/settings'
import type { RootStoreSnapshotIn } from '../root.store'

export const initialState: RootStoreSnapshotIn = {
  welcome: {
    id: 'root_welcome',
  },
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
    options: {
      relays: DEFAULT_RELAYS,
    },
  },
}

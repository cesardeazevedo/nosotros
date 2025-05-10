import type { RootStoreSnapshotIn } from '../root.store'

export const initialState: RootStoreSnapshotIn = {
  auth: {},
  decks: {
    selected: 'root',
    decks: {
      root: {
        id: 'root',
        name: 'My Deck',
        icon: '🤙',
        columns: [],
        modules: {},
      },
    },
  },
  recents: {},
  globalSettings: {
    lang: 'en',
    theme: 'auto',
    clientTag: true,
    sidebarCollapsed: false,
    scroll: {
      reposts: true,
      reactions: true,
      zaps: true,
      replies: true,
    },
  },
  globalContext: {
    nip05: true,
    maxRelaysPerUser: 2,
  },
}

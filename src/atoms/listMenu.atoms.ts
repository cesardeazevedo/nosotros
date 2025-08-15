import { atom } from 'jotai'

export type ListView = 'menu' | 'bookmarks' | 'followSets' | 'relaySets' | 'starterPacks'

export const listTypeViewAtom = atom<ListView>('menu')
export const listTypeBackAtom = atom(null, (_, set) => {
  set(listTypeViewAtom, 'menu')
})

export const listTypeTitleAtom = atom((get) => {
  const view = get(listTypeViewAtom)
  switch (view) {
    case 'bookmarks': {
      return 'Bookmarks'
    }
    case 'followSets': {
      return 'Follow Sets'
    }
    case 'relaySets': {
      return 'Relay Sets'
    }
    case 'starterPacks': {
      return 'Starter Packs'
    }
    default: {
      return 'Lists'
    }
  }
})

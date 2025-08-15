import { STORAGE_SETTINGS_KEY } from '@/constants/storage'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type Settings = {
  lang: 'en' | 'pt'
  theme: 'light' | 'dark' | 'auto'
  nip05: boolean
  autoPlay: boolean
  defaultEmoji: string
  defaultUploadType: string
  defaultUploadUrl: string
  sidebarCollapsed: boolean
  recentsCollapsed: boolean
  maxRelaysPerUser: number
  clientTag: boolean
}

const DEFAULT_SETTINGS: Settings = {
  lang: 'en',
  theme: 'auto',
  nip05: true,
  autoPlay: true,
  defaultEmoji: '',
  defaultUploadType: 'nip96',
  defaultUploadUrl: 'https://nostr.build',
  sidebarCollapsed: false,
  recentsCollapsed: false,
  maxRelaysPerUser: 2,
  clientTag: true,
}

export const settingsAtom = atomWithStorage<Settings>(STORAGE_SETTINGS_KEY, DEFAULT_SETTINGS, undefined, {
  getOnInit: true,
})

export const setSettingsAtom = atom(null, (get, set, patch: Partial<Settings>) => {
  const curr = get(settingsAtom)
  set(settingsAtom, { ...curr, ...patch })
})

export const toggleSettingAtom = atom(null, (get, set, key: keyof Settings) => {
  const curr = get(settingsAtom)
  if (typeof curr[key] === 'boolean') {
    set(settingsAtom, { ...curr, [key]: !curr[key] })
  }
})

import { STORAGE_SETTINGS_KEY } from '@/constants/storage'
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import type { SyncStorage } from 'jotai/vanilla/utils/atomWithStorage'
import { z } from 'zod'

export const settingsSchema = z
  .object({
    lang: z.enum(['en', 'pt']),
    theme: z.enum(['light', 'dark', 'auto']),
    nip05: z.boolean(),
    delayBroadcast: z.boolean(),
    autoPlay: z.boolean(),
    defaultEmoji: z.string(),
    defaultUploadType: z.enum(['blossom', 'nip96']),
    defaultUploadUrl: z.string().url(),
    sidebarCollapsed: z.boolean(),
    feedsPaneCollapsed: z.boolean().default(false),
    sidebarRelaysCollapsed: z.boolean(),
    notificationsCompact: z.boolean(),
    renderEmbeddingSimilarity: z.boolean(),
    recentsCollapsed: z.boolean(),
    maxRelaysPerUser: z.number().int().nonnegative(),
    clientTag: z.boolean(),
  })
  .strict()

export type Settings = z.infer<typeof settingsSchema>

export const DEFAULT_SETTINGS: Settings = {
  lang: 'en',
  theme: 'auto',
  nip05: true,
  autoPlay: true,
  delayBroadcast: true,
  defaultEmoji: '',
  defaultUploadType: 'nip96',
  defaultUploadUrl: 'https://nostr.build',
  sidebarCollapsed: false,
  feedsPaneCollapsed: false,
  sidebarRelaysCollapsed: false,
  notificationsCompact: false,
  renderEmbeddingSimilarity: false,
  recentsCollapsed: false,
  maxRelaysPerUser: 3,
  clientTag: true,
}

const normalizeSettings = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }

  const normalized = { ...(value as Record<string, unknown>) }
  if ('renderEmbeddingsRank' in normalized && !('renderEmbeddingSimilarity' in normalized)) {
    normalized.renderEmbeddingSimilarity = normalized.renderEmbeddingsRank
  }
  delete normalized.renderEmbeddingsRank

  return normalized
}

const settingsStorageBase = createJSONStorage<Settings>()

const settingsStorage: SyncStorage<Settings> = {
  getItem: (key: string, initialValue: Settings) => {
    const value = settingsStorageBase.getItem(key, initialValue)
    const parsed = settingsSchema.safeParse(normalizeSettings(value))
    return parsed.success ? parsed.data : initialValue
  },
  setItem: settingsStorageBase.setItem,
  removeItem: settingsStorageBase.removeItem,
  subscribe: settingsStorageBase.subscribe,
}

export const settingsAtom = atomWithStorage<Settings>(
  STORAGE_SETTINGS_KEY,
  DEFAULT_SETTINGS,
  settingsStorage,
  { getOnInit: true },
)

export const setSettingsAtom = atom(null, (get, set, patch: Partial<Settings>) => {
  const curr = get(settingsAtom)
  set(settingsAtom, { ...curr, ...patch })
})

export const toggleSettingAtom = atom(null, (get, set, key: keyof Settings, value?: boolean) => {
  const curr = get(settingsAtom)
  if (typeof curr[key] === 'boolean') {
    set(settingsAtom, { ...curr, [key]: value ?? !curr[key] })
  }
})

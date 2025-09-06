import { STORAGE_SETTINGS_KEY } from '@/constants/storage'
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage, unstable_withStorageValidator as withStorageValidator } from 'jotai/utils'
import { z } from 'zod'

export const settingsSchema = z
  .object({
    lang: z.enum(['en', 'pt']),
    theme: z.enum(['light', 'dark', 'auto']),
    nip05: z.boolean(),
    autoPlay: z.boolean(),
    defaultEmoji: z.string(),
    defaultUploadType: z.string(),
    defaultUploadUrl: z.string().url(),
    sidebarCollapsed: z.boolean(),
    sidebarRelaysCollapsed: z.boolean(),
    notificationsCompact: z.boolean(),
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
  defaultEmoji: '',
  defaultUploadType: 'nip96',
  defaultUploadUrl: 'https://nostr.build',
  sidebarCollapsed: false,
  sidebarRelaysCollapsed: false,
  notificationsCompact: false,
  recentsCollapsed: false,
  maxRelaysPerUser: 3,
  clientTag: true,
}

const isSettings = (value: unknown): value is Settings => settingsSchema.safeParse(value).success

export const settingsAtom = atomWithStorage<Settings>(
  STORAGE_SETTINGS_KEY,
  DEFAULT_SETTINGS,
  withStorageValidator(isSettings)(createJSONStorage()),
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

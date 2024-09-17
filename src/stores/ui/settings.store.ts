import { STORAGE_SETTINGS } from '@/constants/localStorage'
import type { ThemeKeys } from '@/themes/types'
import { autorun, makeAutoObservable } from 'mobx'
import { defaultNostrSettings, type NostrSettings } from 'nostr/settings'

enum Languages {
  EN = 'English',
  PT = 'Portuguese',
}

type ImgProxyPreset = 'feed_img' | 'user_avatar'

type Settings = {
  lang: string
  theme: ThemeKeys
  defaultEmoji: string
  imgproxy: string
  nostrSettings: NostrSettings
}

export const defaultSettings: Settings = {
  lang: Languages.EN,
  theme: 'auto',
  defaultEmoji: '',
  imgproxy: import.meta.env.VITE_IMGPROXY_URL,
  nostrSettings: defaultNostrSettings,
}

const item = localStorage.getItem(STORAGE_SETTINGS)
const data = Object.assign({}, defaultSettings, item ? (JSON.parse(item || '{}') as Settings) : defaultSettings)

export class SettingsStore {
  lang = data.lang
  defaultEmoji = data.defaultEmoji
  imgproxy = data.imgproxy
  nostrSettings = data.nostrSettings
  theme = data.theme

  constructor() {
    makeAutoObservable(this)

    autorun(() => {
      localStorage.setItem(
        STORAGE_SETTINGS,
        JSON.stringify({
          lang: this.lang,
          theme: this.theme,
          defaultEmoji: this.defaultEmoji,
          nostrSettings: this.nostrSettings,
        }),
      )
    })
  }

  setLang(lang: Languages) {
    this.lang = lang
  }

  setTheme(theme: ThemeKeys) {
    this.theme = theme
  }

  getImgProxyUrl(preset: ImgProxyPreset, src: string) {
    return `${this.imgproxy}/_/${preset}/plain/${src}`
  }

  toggleSettings(
    field: keyof Pick<
      NostrSettings,
      'outboxEnabled' | 'hintsEnabled' | 'nip05enabled' | 'nip25enabled' | 'nip57enabled'
    >,
  ) {
    this.nostrSettings[field] = !this.nostrSettings[field]
  }
}

export const settingsStore = new SettingsStore()

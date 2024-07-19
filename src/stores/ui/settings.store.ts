import { autorun, makeAutoObservable } from 'mobx'
import { defaultNostrSettings, type NostrSettings } from 'nostr/settings'

enum Languages {
  EN = 'English',
  PT = 'Portuguese',
}

type ImgProxyPreset = 'feed_img' | 'user_avatar'

type Settings = {
  lang: string
  defaultEmoji: string
  imgproxy: string
  nostrSettings: NostrSettings
}

const defaultSettings: Settings = {
  lang: Languages.EN,
  defaultEmoji: '',
  imgproxy: import.meta.env.VITE_IMGPROXY_URL,
  nostrSettings: defaultNostrSettings
}

const item = localStorage.getItem('nostrSettings')
const data = Object.assign({}, defaultSettings, item ? (JSON.parse(item || '{}') as Settings) : defaultSettings)

export class SettingsStore {
  lang = data.lang
  defaultEmoji = data.defaultEmoji
  imgproxy = data.imgproxy
  nostrSettings = data.nostrSettings

  constructor() {
    makeAutoObservable(this)

    autorun(() => {
      localStorage.setItem('nostrSettings', JSON.stringify({
        lang: this.lang,
        defaultEmoji: this.defaultEmoji,
        nostrSettings: this.nostrSettings,
      }))
    })
  }

  setLang(lang: Languages) {
    this.lang = lang
  }

  getImgProxyUrl(preset: ImgProxyPreset, src: string) {
    return `${this.imgproxy}/_/${preset}/plain/${src}`
  }

  toggleSettings(field: keyof Pick<NostrSettings, 'outboxEnabled' | 'hintsEnabled' | 'nip25enabled'>) {
    this.nostrSettings[field] = !this.nostrSettings[field]
  }
}

export const settingsStore = new SettingsStore()

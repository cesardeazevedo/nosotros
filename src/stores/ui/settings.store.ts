import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'
import { defaultNostrSettings, type NostrSettings } from 'nostr/settings'

enum Languages {
  EN = 'English',
  PT = 'Portuguese',
}

type ImgProxyPreset = 'feed_img' | 'user_avatar'

export class SettingsStore {
  lang = Languages.EN
  defaultEmoji = ''
  imgproxy = import.meta.env.VITE_IMGPROXY_URL

  nostrSettings: NostrSettings = { ...defaultNostrSettings }

  constructor() {
    makeAutoObservable(this)

    makePersistable(this, {
      name: 'settings',
      properties: ['lang', 'defaultEmoji'],
      storage: window.localStorage,
    })
  }

  setLang(lang: Languages) {
    this.lang = lang
  }

  getImgProxyUrl(preset: ImgProxyPreset, src: string) {
    return `${this.imgproxy}/_/${preset}/plain/${src}`
  }
}

export const settingsStore = new SettingsStore()

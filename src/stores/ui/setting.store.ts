import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

enum Languages {
  EN = 'English',
  PT = 'Portuguese',
}

type ImgProxyPreset = 'feed_img' | 'user_avatar'

export class SettingStore {
  // UI
  lang = Languages.EN
  defaultEmoji = '🤙'

  hideEmojis = false
  hideVerificationLabels = false

  maxRelaysPerUser = 5

  imgproxy = import.meta.env.VITE_IMGPROXY_URL

  constructor() {
    makeAutoObservable(this)

    makePersistable(this, {
      name: 'settings',
      properties: ['lang', 'defaultEmoji', 'hideEmojis', 'hideVerificationLabels', 'maxRelaysPerUser'],
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

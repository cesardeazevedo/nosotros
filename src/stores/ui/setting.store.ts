import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'

enum Languages {
  EN = 'English',
  PT = 'Portuguese',
}

export class SettingStore {
  // UI
  lang = Languages.EN
  defaultEmoji = '🤙'

  hideEmojis = false
  hideVerificationLabels = false

  maxRelaysPerUser = 10

  imgproxy = import.meta.env.VITE_IMGPROXY_URL

  constructor() {
    makeAutoObservable(this)

    makePersistable(this, {
      name: 'settings',
      properties: ['lang', 'defaultEmoji', 'hideEmojis', 'hideVerificationLabels', 'maxRelaysPerUser', 'imgproxy'],
      storage: window.localStorage,
    })
  }

  setLang(lang: Languages) {
    this.lang = lang
  }

  getImgProxyUrl(options: string, src: string) {
    return `${this.imgproxy}/${options}/${src}`
  }
}

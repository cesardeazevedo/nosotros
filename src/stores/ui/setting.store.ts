import { makeAutoObservable } from 'mobx'

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

  maxRelaysPerUser = 4

  constructor() {
    makeAutoObservable(this)
  }

  setLang(lang: Languages) {
    this.lang = lang
  }
}

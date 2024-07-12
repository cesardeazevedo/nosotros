import { makeAutoObservable, observable } from 'mobx'

type NotificationOptions = {
  id?: string
  pubkey: string
}

// TODO
export class NotificationModule {
  data = observable.map<string, string>()

  id: string
  options: NotificationOptions

  constructor(options: NotificationOptions) {
    makeAutoObservable(this)

    this.id = options.id || Math.random().toString().slice(2, 10)

    this.options = options
  }

  paginate() {}

  start() {
    return undefined
  }

  reset() {}
}

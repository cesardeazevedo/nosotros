import { makeAutoObservable, observable } from 'mobx'
import { FeedStore } from 'stores/modules/feed.store'

export class DeckStore {
  static MAIN_FEED = 'main_feed'

  enabled = false

  columns = observable.map<string, FeedStore>()

  constructor() {
    makeAutoObservable(this)
  }

  get mainFeed() {
    return this.columns.get(DeckStore.MAIN_FEED)
  }

  add(key: string, feed: FeedStore) {
    this.columns.set(key, feed)
  }

  remove(key: string) {
    this.columns.delete(key)
  }

  reset() {
    this.columns.clear()
  }
}

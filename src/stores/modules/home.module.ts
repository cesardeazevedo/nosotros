import { FeedModule } from './feed.module'

export type HomeOptions = {
  id: string
  pubkey: string
  type: 'home'
}

export class HomeModule {
  feed: FeedModule
  options: HomeOptions

  constructor(options: { pubkey: string; id?: string }) {
    this.feed = new FeedModule({
      id: options.id || 'home',
      pipeline: 'subFeedFromFollows',
      filter: { authors: [options.pubkey] },
    })

    this.options = {
      id: this.feed.id,
      type: 'home',
      pubkey: options.pubkey,
    }
  }

  get id() {
    return this.feed.id
  }
}

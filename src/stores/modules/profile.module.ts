import { Duration } from 'luxon'
import { FeedModule } from './feed.module'

export type ProfileOptions = {
  id: string
  type: 'user'
  pubkey: string
  relays?: string[]
}

export class ProfileModule {
  feed: FeedModule
  options: ProfileOptions

  constructor(options: { id?: string; pubkey: string; relays?: string[] }) {
    const { id, pubkey, relays } = options
    this.feed = new FeedModule({
      id: id || pubkey,
      pipeline: 'subFeed',
      range: Duration.fromObject({ days: 4 }).as('minutes'),
      subscription: {
        relayHints: {
          authors: {
            [pubkey]: relays || [],
          },
        },
      },
      filter: {
        authors: [pubkey],
      },
    })
    this.options = {
      id: this.feed.id,
      type: 'user',
      pubkey,
      relays,
    }
  }

  get id() {
    return this.feed.id
  }
}

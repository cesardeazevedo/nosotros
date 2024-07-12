import { RECOMMENDED_PUBKEYS } from 'constants/recommended'
import { FeedModule } from './feed.module'

export type GuestOptions = {
  id: 'guest'
  type: 'guest'
}

export class GuestModule {
  feed = new FeedModule({
    id: 'guest',
    pipeline: 'subFeed',
    filter: { authors: RECOMMENDED_PUBKEYS },
  })

  options: GuestOptions = { id: 'guest', type: 'guest' }

  get id() {
    return this.feed.id
  }
}

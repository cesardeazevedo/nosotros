import { RECOMMENDED_PUBKEYS } from 'constants/recommended'
import { FeedModule } from './feed.module'
import { Duration } from 'luxon'

export type GuestOptions = {
  id: 'guest'
  type: 'guest'
}

export class GuestModule {
  feed = new FeedModule({
    id: 'guest',
    feed: 'subFeed',
    range: Duration.fromObject({ hour: 1 }).as('minutes'),
    filter: { authors: RECOMMENDED_PUBKEYS },
  })

  options: GuestOptions = { id: 'guest', type: 'guest' }

  get id() {
    return this.feed.id
  }
}

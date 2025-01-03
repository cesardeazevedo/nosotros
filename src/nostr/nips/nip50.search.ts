import { Kind } from '@/constants/kinds'
import { NostrSubscription } from '@/core/NostrSubscription'
import { start } from '@/core/operators/start'
import { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { map, of, toArray } from 'rxjs'
import type { NostrClient } from '../nostr'
import { parseUser } from './nip01/metadata/parseUser'

export class NIP50Search {
  constructor(private client: NostrClient) {}

  subscribe(query: string, limit = 10) {
    const filter = {
      kinds: [Kind.Metadata],
      search: query,
      limit,
    }

    const sub = new NostrSubscription(filter, { relays: of(['wss://relay.nostr.band']) })

    return of(sub).pipe(
      start(this.client.pool),
      map(([, event]) => event),

      map((event) => {
        const user = new User(event, parseUser(event))
        userStore.add(user)
        return user
      }),

      toArray(),
      // TODO: filter web of trust
    )
  }
}

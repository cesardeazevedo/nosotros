import { mapMetadata } from '@/nostr/operators/mapMetadata'
import { ShareReplayCache } from '@/nostr/replay'
import type { User } from '@/stores/users/user'
import { userStore } from '@/stores/users/users.store'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { ignoreElements, map, merge } from 'rxjs'
import { parseUser } from './metadata/parseUser'

const kinds = [Kind.Metadata]

export const replay = new ShareReplayCache<User>()

export class NIP01Users {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    const relayLists$ = this.client.relayList.subscribe(pubkey)

    const stream$ = this.client.subscribe({ kinds, authors: [pubkey] }, options).pipe(
      mapMetadata(parseUser),

      map(([event, metadata]) => {
        const user = userStore.add(event, metadata)
        this.client.dns.enqueue(metadata)
        return user
      }),
    )
    return merge(stream$, relayLists$.pipe(ignoreElements()))
  })
}

import { ofKind } from '@/core/operators/ofKind'
import { Kind } from 'constants/kinds'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventFollow } from '../types'

export const replay = new ShareReplayCache<NostrEventFollow>()

const kinds = [Kind.Follows]

export class NIP02Follows {
  constructor(private client: NostrClient) {}

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions) => {
    return this.client.subscribe({ kinds, authors: [pubkey] }, options).pipe(ofKind<NostrEventFollow>(kinds))
  })
}

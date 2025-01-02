import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import { Kind } from 'constants/kinds'
import { OUTBOX_RELAYS } from 'constants/relays'
import type { NostrEvent } from 'nostr-tools'
import type { ClientSubOptions, NostrClient } from 'nostr/nostr'
import type { Observable } from 'rxjs'
import { map, of } from 'rxjs'
import { ShareReplayCache } from '../replay'

export interface UserRelayDB {
  pubkey: string
  relay: string
  permission: number
}

export const READ = 1 << 0
export const WRITE = 1 << 1
const PERMISSIONS = { READ, WRITE }

export const replay = new ShareReplayCache<UserRelayDB[]>()

export class NIP65RelayList {
  constructor(private client: NostrClient) {}

  parse(event: NostrEvent) {
    const { tags, pubkey } = event
    const grouped = tags
      .filter((tag) => tag[0] === 'r')
      .reduce<Record<string, UserRelayDB>>((acc, tag) => {
        const [, url, perm] = tag
        const relay = formatRelayUrl(url)
        const prev = acc[relay] || {}
        const name = perm?.toUpperCase() as keyof typeof PERMISSIONS | undefined
        const permission = name ? PERMISSIONS[name] : READ | WRITE
        return {
          ...acc,
          [relay]: {
            ...prev,
            pubkey,
            relay,
            permission: prev.permission | permission,
          },
        }
      }, {})
    return Object.values(grouped)
  }

  subscribe = replay.wrap((pubkey: string, options?: ClientSubOptions): Observable<UserRelayDB[]> => {
    const filter = { kinds: [Kind.RelayList], authors: [pubkey] }
    return this.client.subscribe(filter, { relays: of(OUTBOX_RELAYS), ...options }).pipe(
      map((event) => {
        const userRelay = this.parse(event)
        userRelayStore.add(event.pubkey, userRelay)
        this.client.mailbox.emit(event)
        return userRelay
      }),
    )
  })
}

import { READ, WRITE, type UserMetadata } from '@/nostr/types'
import { followsStore } from '@/stores/follows/follows.store'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import type { NostrEvent } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import { encodeSafe } from 'utils/nip19'
import { listStore } from '../lists/lists.store'
import { nip05store } from '../nip05/nip05.store'
import { relaysStore } from '../relays/relays.store'
import { userRelayStore } from '../userRelays/userRelay.store'

export class User {
  constructor(
    public event: NostrEvent,
    public metadata: UserMetadata,
  ) {
    makeAutoObservable(this, { event: false, metadata: false })
  }

  get id() {
    return this.event.id
  }

  get meta() {
    return this.metadata
  }

  get pubkey() {
    return this.event.pubkey
  }

  get displayName() {
    return this.meta?.displayName || this.meta?.display_name || this.meta?.name || this.id?.slice(0, 10)
  }

  get initials() {
    return this.displayName[0]
  }

  get nip05() {
    const nip05 = this.meta.nip05
    const verified = nip05store.get(nip05)?.nip05
    return verified?.startsWith('_@') ? verified.slice(2) : verified
  }

  get mutedAuthors() {
    return listStore.muteP.get(this.pubkey)
  }

  get mutedNotes() {
    return listStore.muteE.get(this.pubkey)
  }

  isEventMuted = computedFn((event: NostrEvent) => {
    const isMutedEvent = this.mutedNotes?.has(event.id)
    const isMutedAuthor = this.mutedAuthors?.has(event.pubkey)
    return !(isMutedEvent || isMutedAuthor)
  })

  get userRelays() {
    return userRelayStore.get(this.pubkey)
  }

  get outboxRelays() {
    return this.userRelays?.filter((x) => !!(x.permission & READ)) || []
  }

  get inboxRelays() {
    return this.userRelays?.filter((x) => !!(x.permission & WRITE)) || []
  }

  get relays() {
    return userRelayStore.getRelays(this.pubkey) || []
  }

  get headRelay() {
    return this.relays[0]
  }

  get canReceiveZap() {
    return !!this.metadata.lud06 || !!this.metadata.lud16
  }

  get connectedRelays() {
    const relays = this.userRelays
    if (relays) {
      return relays.filter((userRelay) => {
        const relay = relaysStore.relays.get(userRelay.relay)
        return relay?.connected || false
      })
    }
    return []
  }

  get nprofile() {
    return encodeSafe(() => {
      return nip19.nprofileEncode({
        pubkey: this.pubkey,
        relays: this.relays,
      })
    })
  }

  get following() {
    return followsStore.get(this.pubkey)
  }

  joinedRelay = computedFn((relay: string) => {
    return !!this.userRelays?.find((x) => x.relay === relay)
  })
}

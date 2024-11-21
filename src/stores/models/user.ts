import { makeAutoObservable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import type { UserMetadataDB } from 'nostr/types'
import { followsStore } from 'stores/nostr/follows.store'
import { encodeSafe } from 'utils/nip19'
import { relaysStore } from '../nostr/relays.store'
import { userRelayStore } from '../nostr/userRelay.store'

export class User {
  constructor(
    public event: NostrEvent,
    public metadata: UserMetadataDB,
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

  get userRelays() {
    return userRelayStore.get(this.pubkey)
  }

  get relays() {
    return userRelayStore.getRelays(this.pubkey) || []
  }

  get headRelay() {
    return this.relays[0]
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
}

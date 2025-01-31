import { pool } from '@/nostr/pool'
import type { NostrEventComment, NostrEventNote } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { encodeSafe } from '@/utils/nip19'
import { nip19 } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { seenStore } from '../seen/seen.store'
import type { User } from '../users/user'
import { userStore } from '../users/users.store'

export class Event {
  constructor(public event: NostrEventNote | NostrEventComment) {}

  get id() {
    return this.event.id
  }

  get pubkey() {
    return this.event.pubkey
  }

  get metadata() {
    return this.event[metadataSymbol]
  }

  get user() {
    return userStore.get(this.event.pubkey)
  }

  get seenOn() {
    return seenStore.get(this.id) || []
  }

  get headRelay() {
    return this.seenOn.filter((x) => !pool.blacklisted.has(x))?.[0]
  }

  get pow() {
    return this.metadata.tags.nonce?.flat()
  }

  get alt() {
    return this.metadata.tags.alt?.flat()?.[1]
  }

  get d() {
    return this.metadata.tags.d?.flat()?.[1]
  }

  get isAddressable() {
    return isParameterizedReplaceableKind(this.event.kind)
  }

  get address() {
    return `${this.event.kind}:${this.pubkey}:${this.d}`
  }

  get nprofile() {
    return this.user?.nprofile
  }

  get nevent() {
    return encodeSafe(() =>
      nip19.neventEncode({
        id: this.id,
        author: this.event.pubkey,
        kind: this.event.kind,
        relays: this.seenOn,
      }),
    )
  }

  get naddress() {
    const dtag = this.d
    if (dtag) {
      return encodeSafe(() =>
        nip19.naddrEncode({
          pubkey: this.event.pubkey,
          kind: this.event.kind,
          identifier: dtag,
          relays: this.seenOn,
        }),
      )
    }
  }

  isFollowing(user?: User) {
    return user?.following?.followsPubkey(this.event.pubkey) || false
  }
}

import { parseTags } from '@/nostr/helpers/parseTags'
import { pool } from '@/nostr/pool'
import type { NostrEventMetadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { encodeSafe } from '@/utils/nip19'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import { nip19 } from 'nostr-tools'
import { isParameterizedReplaceableKind, isReplaceableKind } from 'nostr-tools/kinds'
import { seenStore } from '../seen/seen.store'
import type { User } from '../users/user'
import { userStore } from '../users/users.store'

const keepAlive = { keepAlive: true }

export class Event {
  constructor(public event: NostrEventMetadata) {
    makeAutoObservable(this, {
      event: false,
    })
  }

  get id() {
    return this.event.id
  }

  get key() {
    const { id, kind, pubkey } = this.event
    return this.isReplaceable ? [kind, pubkey].join(':') : this.isAddressable ? [kind, pubkey, this.d].join(':') : id
  }

  get pubkey() {
    return this.event.pubkey
  }

  get metadata() {
    return this.event[metadataSymbol]
  }

  get kind() {
    return this.event.kind
  }

  get tags() {
    return this.metadata && 'tags' in this.metadata ? this.metadata.tags || {} : parseTags(this.event.tags)
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
    return this.tags.nonce?.flat()
  }

  get alt() {
    return this.tags.alt?.flat()?.[1]
  }

  get d() {
    return this.tags.d?.flat()?.[1]
  }

  get isAddressable() {
    return isParameterizedReplaceableKind(this.event.kind)
  }

  get isReplaceable() {
    return isReplaceableKind(this.event.kind)
  }

  get replaceble() {
    return [this.kind, this.pubkey].join(':')
  }

  get address() {
    return [this.kind, this.pubkey, this.d].join(':')
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

  getTag = computedFn((tag: string) => this.tags[tag]?.[0][1], keepAlive)
  getTags = computedFn((tag: string) => this.tags[tag]?.map((x) => x[1]) || [], keepAlive)

  isFollowing(user?: User) {
    return user?.followsPubkey(this.event.pubkey) || false
  }
}

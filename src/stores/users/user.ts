import { Kind } from '@/constants/kinds'
import type { NostrEventMetadata } from '@/nostr/types'
import { metadataSymbol, READ, WRITE } from '@/nostr/types'
import { makeAutoObservable } from 'mobx'
import { computedFn } from 'mobx-utils'
import type { NostrEvent } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import { encodeSafe } from 'utils/nip19'
import { eventStore } from '../events/event.store'
import { nip05store } from '../nip05/nip05.store'
import { relaysStore } from '../relays/relays.store'

export class User {
  constructor(public event: NostrEventMetadata) {
    makeAutoObservable(this, { event: false })
  }

  get id() {
    return this.event.id
  }

  get metadata() {
    return this.event[metadataSymbol].userMetadata || {}
  }

  get pubkey() {
    return this.event.pubkey
  }

  get displayName() {
    return this.metadata?.displayName || this.metadata?.display_name || this.metadata?.name || this.id?.slice(0, 10)
  }

  get initials() {
    return this.displayName[0]
  }

  get nip05() {
    const nip05 = this.metadata.nip05
    const verified = nip05store.get(nip05)?.nip05
    return verified?.startsWith('_@') ? verified.slice(2) : verified
  }

  get reactions() {
    return eventStore.mapEvents(eventStore.getIdsByKindPubkeyTag(Kind.Reaction, this.pubkey, 'e'))
  }

  reactionByEventId(id: string) {
    return eventStore.getEventsByKindPubkeyTagValue(Kind.Reaction, this.pubkey, 'e', id)?.[0]
  }

  zapByEventId(id: string) {
    return eventStore.getEventsByKindPubkeyTagValue(Kind.ZapReceipt, this.pubkey, 'e', id)?.[0]
  }

  repostedByEventId(id: string) {
    return eventStore.getEventsByKindPubkeyTagValue(Kind.Repost, this.pubkey, 'e', id)?.[0]
  }

  get mutedAuthors() {
    return eventStore.getIdsByKindPubkeyTag(Kind.Mutelist, this.pubkey, 'p')
  }

  get mutedNotes() {
    return eventStore.getIdsByKindPubkeyTag(Kind.Mutelist, this.pubkey, 'e')
  }

  get blossomServerList() {
    return eventStore.getEventsByKindPubkey(Kind.BlossomServerList, this.pubkey)?.[0]?.getTags('server') || []
  }

  isEventMuted = computedFn((event: NostrEvent) => {
    const isMutedEvent = this.mutedNotes?.has(event.id)
    const isMutedAuthor = this.mutedAuthors?.has(event.pubkey)
    return !!(isMutedEvent || isMutedAuthor)
  })

  get relayList() {
    const event = eventStore.getEventsByKindPubkey(Kind.RelayList, this.pubkey)?.[0]?.event as
      | NostrEventMetadata
      | undefined
    return event ? event[metadataSymbol].relayList : []
  }

  get relays() {
    return this.relayList?.map((x) => x.relay) || []
  }

  get relaySets() {
    return eventStore.getEventsByKindPubkey(Kind.RelaySets, this.pubkey).toSorted((a, b) => {
      const total1 = a.tags.relay?.length || 0
      const total2 = b.tags.relay?.length || 0
      return total2 - total1
    })
  }

  get othersRelaySets() {
    return eventStore
      .getEventsByKind(Kind.RelaySets)
      .filter((x) => x.pubkey !== this.pubkey && x.getTags('relay').length > 0)
      .toSorted((a, b) => {
        const total1 = a.getTags('relay').length || 0
        const total2 = b.getTags('relay').length || 0
        return total2 - total1
      })
  }

  get followSets() {
    return eventStore.getEventsByKindPubkey(Kind.FollowSets, this.pubkey).toSorted((a, b) => {
      const total1 = a.getTags('p').length
      const total2 = b.getTags('p').length
      return total2 - total1
    })
  }

  get othersFollowSets() {
    const events = eventStore.getEventsByKind(Kind.FollowSets)
    return events
      .filter((x) => x.pubkey !== this.pubkey && x.getTags('p').length > 0)
      .toSorted((a, b) => {
        const total1 = a.getTags('p').length
        const total2 = b.getTags('p').length
        return total2 - total1
      })
  }

  get outboxRelays() {
    return this.relayList?.filter((x) => !!(x.permission & WRITE)) || []
  }

  get inboxRelays() {
    return this.relayList?.filter((x) => !!(x.permission & READ)) || []
  }

  get headRelay() {
    return this.relays[0]
  }

  get canReceiveZap() {
    return !!this.metadata.lud06 || !!this.metadata.lud16
  }

  get connectedRelays() {
    const relays = this.relayList
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

  get followsEvent() {
    return eventStore.getEventsByKindPubkey(Kind.Follows, this.pubkey)?.[0]
  }

  get totalFollows() {
    return this.followsEvent?.getTags('p')?.length || 0
  }

  followsPubkey(pubkey: string | undefined) {
    if (!pubkey) return false
    return eventStore.getEventsByKindPubkeyTagValue(Kind.Follows, this.pubkey, 'p', pubkey)?.length > 0
  }

  joinedRelay = computedFn((relay: string) => {
    return !!this.relayList?.find((x) => x.relay === relay)
  })
}

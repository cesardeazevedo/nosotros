import { Kind } from '@/constants/kinds'
import type { NostrEventMetadata } from '@/nostr/types'
import type { ObservableMap } from 'mobx'
import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { Event } from './event'

const opts = {}

export class EventStore {
  events = observable.map<string, Event>({}, opts)
  eventsReplaceable = observable.map<string, Event>({}, opts)
  eventsAddressable = observable.map<string, Event>({}, opts)

  indexKind = observable.map<Kind, Set<string>>({}, opts)
  indexPubkey = observable.map<string, Set<string>>({}, opts)
  indexKindPubkey = observable.map<string, Set<string>>({}, opts)
  indexKindPubkeyTag = observable.map<string, Set<string>>({}, opts)
  indexKindPubkeyTagValue = observable.map<string, Set<string>>({}, opts)
  indexTags = observable.map<string, Set<string>>({}, opts)
  indexTagsPubkey = observable.map<string, Set<string>>({}, opts)
  indexReplies = observable.map<string, Set<string>>({}, opts)
  indexRepliesAddress = observable.map<string, Set<string>>({}, opts)

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.events.clear()
    this.eventsReplaceable.clear()
    this.eventsAddressable.clear()
    this.indexKind.clear()
    this.indexPubkey.clear()
    this.indexKindPubkey.clear()
    this.indexKindPubkeyTag.clear()
    this.indexKindPubkeyTagValue.clear()
    this.indexTags.clear()
    this.indexTagsPubkey.clear()
    this.indexReplies.clear()
    this.indexRepliesAddress.clear()
  }

  get stats() {
    return {
      total: this.events.size,
      totalByKind: [...this.indexKind.keys()].map((kind) => ({ [kind]: this.indexKind.get(kind)?.size || 0 })),
      tags: this.indexTags.size,
    }
  }

  private toArray(ids: Set<string> | undefined) {
    return [...(ids || [])]
  }

  mapEvents(ids: Set<string> | undefined) {
    return this.toArray(ids)
      .map((id) => this.get(id))
      .filter((x) => !!x)
  }

  has(id: string) {
    return this.events.has(id)
  }

  get(id: string | undefined): Event | undefined {
    if (!id) {
      return undefined
    }
    const first = id.indexOf(':')
    if (first === -1) {
      return this.events.get(id || '')
    }
    const second = id.indexOf(':', first + 1)
    if (second === -1) {
      return this.eventsReplaceable.get(id)
    }
    return this.eventsAddressable.get(id)
  }

  getReplaceable(id: string | undefined) {
    return this.eventsReplaceable.get(id || '')
  }

  getIdsByKind(kind: Kind) {
    return this.indexKind.get(kind)
  }

  getEventsByKind(kind: Kind) {
    return this.mapEvents(this.getIdsByKind(kind))
  }

  getIdsByPubkey(pubkey: string | undefined) {
    return this.indexPubkey.get(pubkey || '')
  }

  getEventsByPubkey(pubkey: string | undefined) {
    return this.mapEvents(this.getIdsByPubkey(pubkey))
  }

  getIdsByKindPubkey(kind: Kind, pubkey: string | undefined) {
    return this.indexKindPubkey.get([kind, pubkey].join(':'))
  }

  getEventsByKindPubkey(kind: Kind, pubkey: string | undefined) {
    return this.mapEvents(this.getIdsByKindPubkey(kind, pubkey))
  }

  getIdsByKindTagValue(kind: Kind, tag: string, value: string) {
    return this.indexTags.get([kind, tag, value].join(':'))
  }

  getPubkeysByKindTagValue(kind: Kind, tag: string, value: string) {
    return this.indexTagsPubkey.get([kind, tag, value].join(':'))
  }

  getEventsByKindTagValue(kind: Kind, tag: string, value: string) {
    return this.mapEvents(this.getIdsByKindTagValue(kind, tag, value))
  }

  getTotalByKindTagValue(kind: Kind, tag: string, value: string) {
    return this.getIdsByKindTagValue(kind, tag, value)?.size || 0
  }

  getIdsByKindPubkeyTag(kind: Kind, pubkey: string, tag: string) {
    return this.indexKindPubkeyTag.get([kind, pubkey, tag].join(':'))
  }

  getIdsByKindPubkeyTagValue(kind: Kind, pubkey: string, tag: string, value: string) {
    return this.indexKindPubkeyTagValue.get([kind, pubkey, tag, value].join(':'))
  }

  getEventsByKindPubkeyTagValue(kind: Kind, pubkey: string, tag: string, value: string) {
    return this.mapEvents(this.getIdsByKindPubkeyTagValue(kind, pubkey, tag, value))
  }

  getReplies(event: Event) {
    return new Set([
      ...this.toArray(this.indexReplies.get(event.id)),
      ...this.toArray(this.indexRepliesAddress.get(event.address)),
    ])
  }

  getRepliesEvents(event: Event) {
    return this.mapEvents(this.getReplies(event))
  }

  private getIndexSet<T>(index: ObservableMap, value: T) {
    if (!index.get(value)) {
      index.set(value, new Set())
    }
    return index.get(value)!
  }

  private deleteTags(event?: Event) {
    if (!event) return
    event.event.tags.forEach(([tag, value]) => {
      const kindTagValue = [event.kind, tag, value].join(':')
      const kindPubkeyTag = [event.kind, event.pubkey, tag].join(':')
      this.indexTags.delete(kindTagValue)
      this.indexTagsPubkey.delete(kindTagValue)
      this.indexKindPubkeyTag.delete(kindPubkeyTag)
    })
  }

  private insert(event: Event) {
    let inserted = false
    if (!this.events.has(event.id)) {
      this.events.set(event.id, event)
      inserted = true
    }
    if (event.isReplaceable || event.isAddressable) {
      const data = event.isReplaceable ? this.eventsReplaceable : this.eventsAddressable
      const found = data.get(event.key)
      if (event.event.created_at >= (found?.event.created_at || 0)) {
        data.set(event.key, event)
        this.deleteTags(found)
        inserted = true
      }
    }
    return inserted
  }

  add(nostrEvent: NostrEvent, skipTags?: boolean) {
    const event = new Event(nostrEvent as NostrEventMetadata)
    const found = this.insert(event)
    if (found !== false) {
      const { key, id, pubkey, kind } = event
      const { tags } = nostrEvent

      this.getIndexSet(this.indexKind, kind).add(key)
      this.getIndexSet(this.indexPubkey, pubkey).add(key)
      this.getIndexSet(this.indexKindPubkey, `${kind}:${pubkey}`).add(key)

      if (!skipTags) {
        for (const [tag, value] of tags.filter((tag) => tag.length >= 2)) {
          const kindTagValue = [kind, tag, value].join(':')
          this.getIndexSet(this.indexTags, kindTagValue).add(key)
          // Only index pubkey for relay lists
          if (kind === Kind.RelayList) {
            this.getIndexSet(this.indexTagsPubkey, kindTagValue).add(pubkey)
          }

          const kindPubkeyTag = [kind, pubkey, tag].join(':')
          this.getIndexSet(this.indexKindPubkeyTag, kindPubkeyTag).add(value)

          const kindPubkeyTagValue = [kindPubkeyTag, value].join(':')
          this.getIndexSet(this.indexKindPubkeyTagValue, kindPubkeyTagValue).add(key)
        }
      }

      // handle replies for NIP-10 and NIP-22
      switch (event.kind) {
        case Kind.Text:
        case Kind.Comment: {
          const parentId = event.metadata?.parentId
          if (parentId) {
            const isAddressable = parentId.includes(':')
            this.getIndexSet(isAddressable ? this.indexRepliesAddress : this.indexReplies, parentId).add(id)
          }
          break
        }
        default: {
          break
        }
      }
    }
    return event
  }
}

export const eventStore = new EventStore()

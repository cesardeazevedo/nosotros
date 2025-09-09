import type { BroadcastResponse } from '@/core/operators/broadcast'
import { encodeSafe } from '@/utils/nip19'
import { atom } from 'jotai'
import { nip19, type NostrEvent } from 'nostr-tools'
import { isAddressableKind } from 'nostr-tools/kinds'

export type PublishedEvent = {
  relay: string
  eventId: string
  status: boolean
  msg: string
  event: NostrEvent
}

export const publishesAtom = atom<Record<string, PublishedEvent[]>>({})

export const publishesByIdAtom = (id: string) => atom((get) => get(publishesAtom)[id] ?? [])

export const publishSuccessesAtom = (id: string) =>
  atom((get) => (get(publishesAtom)[id] ?? []).filter((x) => x.status))

export const publishFailuresAtom = (id: string) =>
  atom((get) => (get(publishesAtom)[id] ?? []).filter((x) => !x.status))

export const eventNip19Atom = (event: NostrEvent) =>
  atom((get) => {
    const relays = (get(publishesAtom)[event.id] ?? []).map((x) => x.relay)
    return encodeSafe(() => {
      const identifier = event.tags.find((t) => t[0] === 'd')?.[1]
      if (isAddressableKind(event.kind) && identifier) {
        return nip19.naddrEncode({
          kind: event.kind,
          pubkey: event.pubkey,
          relays,
          identifier,
        })
      }
      return nip19.neventEncode({
        id: event.id,
        kind: event.kind,
        author: event.pubkey,
        relays,
      })
    })
  })

export const addPublishAtom = atom(null, (get, set, payload: BroadcastResponse) => {
  const [relay, eventId, status, msg, event] = payload
  const current = get(publishesAtom)
  set(publishesAtom, {
    ...current,
    [eventId]: current[eventId]
      ? [...current[eventId], { relay, eventId, status, msg, event }]
      : [{ relay, eventId, status, msg, event }],
  })
})

// useful when rebroadcast after auth or some error
export const resetPublishEventRelayAtom = atom(null, (get, set, [eventId, relay]: [string, string]) => {
  const publishes = get(publishesAtom)
  set(publishesAtom, {
    ...publishes,
    [eventId]: publishes[eventId].filter((x) => x.relay !== relay),
  })
})

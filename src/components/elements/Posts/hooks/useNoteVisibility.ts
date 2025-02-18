import { useGlobalSettings } from '@/hooks/useRootStore'
import { subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import type { NostrEventComment, NostrEventMedia, NostrEventNote } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { useNostrClientContext } from '@/stores/nostr/nostr.context.hooks'
import { eventStore } from '@/stores/events/event.store'
import { LRUCache } from 'lru-cache'
import type { NostrEvent } from 'nostr-tools'
import { useObservable, useSubscription } from 'observable-hooks'
import { useEffect, useRef } from 'react'
import { filter, identity, map, mergeMap, Subject, take, tap } from 'rxjs'
import type { NostrContext } from '@/nostr/context'

const cache = new LRUCache({ max: 1000 })

const intersectionSubject = new Subject<IntersectionObserverEntry[]>()
const onItem = intersectionSubject.pipe(
  mergeMap(identity),
  filter((x) => x.isIntersecting),
)

const intersection = new IntersectionObserver(
  (entries) => {
    intersectionSubject.next(entries)
  },
  { threshold: 0 },
)

export function useNoteVisibility(event: NostrEventNote | NostrEventComment | NostrEventMedia) {
  const nostr = useNostrClientContext()
  const ref = useRef<HTMLDivElement | null>(null)
  const globalSettings = useGlobalSettings()

  const sub = useObservable(() => {
    return onItem.pipe(
      filter((x) => x.target === ref.current),
      take(1),
      map(() => event),
      mergeMap((event) => [
        event,
        ...event[metadataSymbol].mentionedNotes.map((x) => eventStore.get(x)).filter((x) => !!x),
      ]),
      filter((event) => !cache.has(event.id)),
      tap((event) => cache.set(event.id, true)),
      mergeMap((event) => {
        const ctx = {
          ...nostr.context,
          subOptions: {
            relayHints: {
              idHints: {
                [event.id]: [event.pubkey],
              },
            },
          },
        } as NostrContext
        return subscribeNoteStats(event as NostrEvent, ctx, globalSettings.scroll)
      }),
    )
  })

  useSubscription(sub)

  useEffect(() => {
    let refElement = null
    if (ref.current && !cache.has(event.id)) {
      intersection.observe(ref.current)
      refElement = ref.current
    }
    return () => {
      if (refElement) {
        intersection.unobserve(refElement)
      }
    }
  }, [])

  return [ref]
}

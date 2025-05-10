import { useGlobalSettings, useRootContext } from '@/hooks/useRootStore'
import { subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import type { NostrEventMetadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { eventStore } from '@/stores/events/event.store'
import { useObservable, useSubscription } from 'observable-hooks'
import { useEffect, useRef } from 'react'
import { filter, identity, map, mergeMap, Subject, take } from 'rxjs'

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

export function useNoteVisibility(event: NostrEventMetadata) {
  const ctx = useRootContext()
  const ref = useRef<HTMLDivElement | null>(null)
  const globalSettings = useGlobalSettings()

  const sub = useObservable(() => {
    return onItem.pipe(
      filter((x) => x.target === ref.current),
      take(1),
      map(() => event),
      mergeMap((event) => [event.id, ...(event[metadataSymbol].mentionedNotes || [])]),
      map((id) => eventStore.get(id)),
      filter((x) => !!x),
      mergeMap(({ event }) => subscribeNoteStats(event, ctx, globalSettings.scroll)),
    )
  })

  useSubscription(sub)

  useEffect(() => {
    let refElement = null
    if (ref.current) {
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

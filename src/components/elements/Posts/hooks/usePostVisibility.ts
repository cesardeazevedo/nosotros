import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { db } from '@/nostr/db'
import { subscribeNoteStats } from '@/nostr/stats'
import { useNostrClientContext } from '@/stores/context/nostr.context.hooks'
import type { Note } from '@/stores/notes/note'
import { LRUCache } from 'lru-cache'
import { DateTime } from 'luxon'
import { useObservable, useSubscription } from 'observable-hooks'
import { useEffect, useRef } from 'react'
import { filter, finalize, identity, map, mergeMap, Subject, take } from 'rxjs'

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

export function usePostVisibility(note: Note) {
  const { client } = useNostrClientContext()
  const settings = useGlobalNostrSettings()
  const ref = useRef<HTMLDivElement | null>(null)

  const sub = useObservable(() => {
    return onItem.pipe(
      filter((x) => x.target === ref.current),
      take(1),
      map(() => note),
      mergeMap((note) => [note, ...note.mentionNotes]),
      filter((id) => !cache.has(id)),
      mergeMap((note) => {
        cache.set(note.id, true)
        return subscribeNoteStats(note.id, client, {
          ...settings.scroll,
          lastSyncedAt: note.metadata.lastSyncedAt,
        }).pipe(
          finalize(() => {
            const now = DateTime.now().set({ second: 0, millisecond: 0 })
            db.metadata.insert({ ...note.metadata, lastSyncedAt: now.toSeconds() })
          }),
        )
      }),
    )
  })

  useSubscription(sub)

  useEffect(() => {
    let refElement = null
    if (ref.current && !cache.has(note.id)) {
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

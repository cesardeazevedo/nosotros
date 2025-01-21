import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import type { NoteStatsOptions } from '@/nostr/subscriptions/subscribeNoteStats'
import { subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import type { Comment } from '@/stores/comment/comment'
import { useNostrClientContext } from '@/stores/context/nostr.context.hooks'
import type { Note } from '@/stores/notes/note'
import { LRUCache } from 'lru-cache'
import { useObservable, useSubscription } from 'observable-hooks'
import { useEffect, useRef } from 'react'
import { filter, identity, map, mergeMap, Subject, take, tap } from 'rxjs'

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

export function useNoteVisibility(note: Note | Comment, options?: NoteStatsOptions) {
  const { client } = useNostrClientContext()
  const settings = useGlobalNostrSettings()
  const ref = useRef<HTMLDivElement | null>(null)

  const sub = useObservable(() => {
    return onItem.pipe(
      filter((x) => x.target === ref.current),
      take(1),
      map(() => note),
      mergeMap((note) => [note, ...note.mentionNotes]),
      filter((note) => !cache.has(note.id)),
      tap((note) => cache.set(note.id, true)),
      mergeMap((note) => {
        return subscribeNoteStats(client, note.event, {
          ...settings.scroll,
          ...options,
        })
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

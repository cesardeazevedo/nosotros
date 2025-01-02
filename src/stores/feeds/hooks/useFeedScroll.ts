import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { db } from '@/nostr/db'
import { subscribeNoteStats } from '@/nostr/stats'
import { useNostrClientContext } from '@/stores/context/nostr.context.hooks'
import { Note } from '@/stores/notes/note'
import { noteStore } from '@/stores/notes/notes.store'
import { Repost } from '@/stores/reposts/repost'
import { DateTime } from 'luxon'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { useCallback } from 'react'
import { delay, distinct, EMPTY, filter, from, mergeMap, of, range, tap } from 'rxjs'
import { type NotesFeed } from '../feed.notes'

export function useFeedScroll(feed: NotesFeed) {
  const { client } = useNostrClientContext()
  const settings = useGlobalNostrSettings()
  const [onRangeChange, rangeChange$] = useObservableCallback<unknown, [number, number]>((event$) => {
    return event$.pipe(
      delay(1000),
      mergeMap(([start, end]) => (start === end ? of(start) : from(range(start, end - start)))),
      filter((index) => !!feed.list[index]),
      distinct(),
      mergeMap((index) => {
        const item = feed.list[index]
        if (item) {
          if (item instanceof Note) {
            return of(item)
          } else if (item instanceof Repost) {
            return of(item.note)
          } else {
            return EMPTY
          }
        }
        return EMPTY
      }),

      mergeMap((note) => [note.id, ...note.metadata.mentionedNotes].map((id) => noteStore.get(id)).filter((x) => !!x)),
      tap((note) => {
        const now = DateTime.now().set({ second: 0, millisecond: 0 })
        db.metadata.insert({ ...note.metadata, lastSyncedAt: now.toSeconds() })
      }),
      mergeMap((note: Note) => {
        return subscribeNoteStats(note.id, client, {
          ...settings.scroll,
          lastSyncedAt: note.metadata.lastSyncedAt,
        })
      }),
    )
  })

  useSubscription(rangeChange$)

  return useCallback(
    (start: number, end: number) => {
      onRangeChange([Math.max(start, 0), end])
    },
    [onRangeChange],
  )
}

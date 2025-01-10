import { Kind } from '@/constants/kinds'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { db } from '@/nostr/db'
import { subscribeNoteStats } from '@/nostr/stats'
import { metadataSymbol } from '@/nostr/types'
import { modelStore } from '@/stores/base/model.store'
import { useNostrClientContext } from '@/stores/context/nostr.context.hooks'
import { Note } from '@/stores/notes/note'
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
        const event = feed.list[index]
        const metadata = event[metadataSymbol]
        switch (metadata.kind) {
          case Kind.Text:
          case Kind.Article: {
            return [metadata.id, ...metadata.mentionedNotes]
          }
          case Kind.Repost: {
            return metadata.mentionedNotes
          }
          default: {
            return EMPTY
          }
        }
      }),
      mergeMap((id) => {
        const item = modelStore.get(id)
        switch (true) {
          case item instanceof Note: {
            return of(item)
          }
          case item instanceof Repost: {
            return of(item.note)
          }
        }
        return EMPTY
      }),
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

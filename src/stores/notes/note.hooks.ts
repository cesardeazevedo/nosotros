import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import type { NoteStatsOptions } from '@/nostr/stats'
import { subscribeNoteStats } from '@/nostr/stats'
import { pluckFirst, useObservable, useSubscription } from 'observable-hooks'
import { filter, finalize, from, mergeMap } from 'rxjs'
import { useObservableNostrContext } from '../context/nostr.context.hooks'
import type { Note } from './note'

export function useNoteStats(note: Note, options?: NoteStatsOptions) {
  const settings = useGlobalNostrSettings()
  const notes$ = useObservable((note$) => note$.pipe(pluckFirst), [note])

  const sub = useObservableNostrContext(({ client }) => {
    return notes$.pipe(
      filter((x) => x.repliesStatus === 'IDLE'),
      mergeMap((note) => {
        note.setRepliesStatus('LOADING')
        return from([note.id, ...note.metadata.mentionedNotes]).pipe(
          mergeMap((id) => {
            return subscribeNoteStats(id, client, {
              ...settings.scroll,
              ...options,
            }).pipe(
              finalize(() => {
                note.setRepliesStatus('LOADED')
              }),
            )
          }),
        )
      }),
    )
  })
  useSubscription(sub)
}

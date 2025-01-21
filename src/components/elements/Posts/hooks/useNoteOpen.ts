import type { ModelEvent } from '@/stores/base/model.store'
import { Note } from '@/stores/notes/note'
import { Repost } from '@/stores/reposts/repost'
import { useEffect } from 'react'

export function useNoteOpen(event?: ModelEvent) {
  useEffect(() => {
    const note = event instanceof Repost ? event.note : event instanceof Note ? event : null
    if (note) {
      note.toggleReplies(true)
      note.toggleContent(true)
    }
    return () => {
      if (note) {
        note.toggleReplies(false)
        note.toggleContent(false)
      }
    }
  }, [event])
}

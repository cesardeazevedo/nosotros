import { useEffect } from 'react'
import { modelStore } from '../base/model.store'
import { Note } from '../notes/note'
import { Repost } from '../reposts/repost'

export function useNoteOpen(id: string) {
  const item = modelStore.get(id)
  useEffect(() => {
    const note = item instanceof Repost ? item.note : item instanceof Note ? item : null
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
  }, [item])
}

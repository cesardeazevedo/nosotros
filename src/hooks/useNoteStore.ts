import type { NostrEventComment, NostrEventNote } from '@/nostr/types'
import { eventStore } from '@/stores/events/event.store'
import { Note } from '@/stores/notes/note'
import { useMemo } from 'react'

export function useNoteStore(event: NostrEventNote | NostrEventComment, open?: boolean) {
  return useMemo(() => new Note(event, open), [event])
}

export function useNoteStoreFromId(id: string | undefined, open?: boolean) {
  const { event } = eventStore.get(id) || {}
  return useMemo(() => (event ? new Note(event, open) : undefined), [event])
}

export function useNoteStoreFromAddress(address: string | undefined, open?: boolean) {
  const { event } = eventStore.getFromAddress(address) || {}
  return useMemo(() => (event ? new Note(event, open) : undefined), [event])
}

import type { NostrEventMetadata } from '@/nostr/types'
import { Event } from '@/stores/events/event'
import { eventStore } from '@/stores/events/event.store'
import { Note } from '@/stores/notes/note'
import { useMemo } from 'react'

export function useNoteStore(_event: NostrEventMetadata, open?: boolean) {
  const event = eventStore.get(_event.id) || new Event(_event)
  return useMemo(() => new Note(event, open), [event])
}

export function useNoteStoreFromId(id: string | undefined, open?: boolean) {
  const event = eventStore.get(id)
  return useMemo(() => (event ? new Note(event, open) : undefined), [event])
}

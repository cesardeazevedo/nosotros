import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { NoteState, useNoteState } from '@/hooks/state/useNote'
import { createContext, useContext } from 'react'

type EventContextValues = {
  event: NostrEventDB
}

type NoteContextValues = {
  note: NoteState
}

const EventContext = createContext<EventContextValues | null>(null)
const NoteContext = createContext<NoteContextValues | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useEventContext = () => {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEventContext must be used within EventProvider')
  }
  return context
}
//
// eslint-disable-next-line react-refresh/only-export-components
export const useNoteContext = () => {
  const context = useContext(NoteContext)
  if (!context) {
    throw new Error('useNoteContext must be used within NoteProvider')
  }
  return context
}

export const EventProvider = (props: { value: EventContextValues; children: React.ReactNode }) => {
  const { children, value } = props
  const note = useNoteState(value.event, { repliesOpen: false })
  return (
    <EventContext.Provider value={value}>
      <NoteProvider value={{ note }}>{children}</NoteProvider>
    </EventContext.Provider>
  )
}

export const NoteProvider = (props: { value: NoteContextValues; children: React.ReactNode }) => {
  const { children, value } = props
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>
}

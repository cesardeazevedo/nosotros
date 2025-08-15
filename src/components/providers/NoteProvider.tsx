import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NoteState } from '@/hooks/state/useNote'
import { createContext, useContext } from 'react'

type NoteContextValues = {
  note: NoteState
  event: NostrEventDB
}

const NoteContext = createContext<NoteContextValues | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useNoteContext = () => {
  const context = useContext(NoteContext)
  if (!context) {
    throw new Error('useNoteContext must be used within NoteProvider')
  }
  return context
}

export const NoteProvider = (props: { value: NoteContextValues; children: React.ReactNode }) => {
  const { children, value } = props
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>
}

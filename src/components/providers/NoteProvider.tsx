import { createContext, useContext } from 'react'

type NoteContextValue = {
  dense?: boolean
  disableLink?: boolean
}

export const NoteContext = createContext<NoteContextValue>({
  dense: false,
  disableLink: false,
})

export const useNoteContext = () => useContext(NoteContext)

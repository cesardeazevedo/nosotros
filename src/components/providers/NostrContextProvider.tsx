import type { NostrContext } from '@/nostr/context'
import { createContext, useContext } from 'react'

const NostrContextReact = createContext<NostrContext | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useNostrContext = () => {
  return useContext(NostrContextReact)
}

export const NostrContextProvider = (props: { value: NostrContext; children: React.ReactNode }) => {
  const { children, value } = props
  return <NostrContextReact.Provider value={value}>{children}</NostrContextReact.Provider>
}

import { rootStore } from '@/stores/root.store'
import React, { createContext } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const RootStoreContext = createContext(rootStore)

type Props = {
  children: React.ReactNode
}

export const RootStoreProvider = (props: Props) => {
  return <RootStoreContext.Provider value={rootStore}>{props.children}</RootStoreContext.Provider>
}

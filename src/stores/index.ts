import { createContext, useContext } from 'react'
import { RootStore } from './root.store'

export { RootStore }

export const store = new RootStore()

const StoreContext = createContext<RootStore>(store)

export const StoreProvider = StoreContext.Provider

export const useStore = () => useContext(StoreContext)

// configure({ enforceActions: 'always' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).store = store

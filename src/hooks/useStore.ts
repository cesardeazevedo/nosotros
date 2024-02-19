import { createContext, useContext } from 'react'
import { store } from 'stores/root.store'

const StoreContext = createContext(store())

export const StoreProvider = StoreContext.Provider

export const useStore = () => useContext(StoreContext)

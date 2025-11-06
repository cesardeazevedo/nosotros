import { createContext, useContext } from 'react'

type RouteUtilsContextValues = {
  // Use to detect masked routes
  hiddenRoute: boolean
}

const RouteUtilsContext = createContext<RouteUtilsContextValues | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useRouteUtilsContext = () => {
  return useContext(RouteUtilsContext) || { hiddenRoute: false }
}

export const RouteUtilsContextProvider = (props: { value: RouteUtilsContextValues; children: React.ReactNode }) => {
  const { children, value } = props
  return <RouteUtilsContext.Provider value={value}>{children}</RouteUtilsContext.Provider>
}

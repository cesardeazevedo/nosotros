import React, { createContext, useContext } from 'react'

export type ContentContextValues = {
  dense: boolean
  disableLink: boolean
  disablePopover: boolean
  autoPlay: boolean | undefined
  isDialog: boolean
  blured: boolean
}

const defaults = {
  dense: false,
  disableLink: false,
  disablePopover: false,
  autoPlay: undefined,
  isDialog: false,
  blured: false,
}

const ContentContext = createContext<ContentContextValues | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useContentContext = () => {
  const context = useContext(ContentContext)
  if (!context) {
    return defaults
  }
  return context
}

export const ContentProvider = (props: { value: Partial<ContentContextValues>; children: React.ReactNode }) => {
  const { children, value } = props
  const prev = useContentContext()
  return <ContentContext.Provider value={{ ...prev, ...value }}>{children}</ContentContext.Provider>
}

import { createContext } from 'react'

export const SidebarContext = createContext({
  renderCollapsedButton: true,
  toggleCollapsed: () => { },
})

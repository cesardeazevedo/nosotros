import { createContext } from 'react'

export type Panes = '/notifications' | false

export const SidebarContext = createContext({
  pane: false as Panes,
  renderCollapsedButton: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPane: (_: Panes) => { },
})

import type { Placement } from '@floating-ui/react'
import { createContext } from 'react'

export type MenuItemContextValue = {
  getItemProps: (userProps?: React.ComponentPropsWithoutRef<'button'>) => Record<string, unknown>
  activeIndex: number | null
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>
  opened: boolean
  placement?: Placement
}

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <MenuItemContext.Provider />.')
}

export const MenuItemContext = createContext<MenuItemContextValue>({
  getItemProps: (userProps) => ({ ...userProps }),
  activeIndex: null,
  setActiveIndex: stub,
  opened: false,
  placement: undefined,
})

import type { Placement } from '@floating-ui/react'
import { createContext } from 'react'

export type MenuContextValue = {
  opened: boolean
  getTriggerProps: (userProps?: React.ComponentPropsWithoutRef<'button'>) => Record<string, unknown>
  triggerRef: React.Ref<HTMLButtonElement>
  placement?: Placement
}

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <MenuContext.Provider />.')
}

export const MenuContext = createContext<MenuContextValue>({
  opened: false,
  getTriggerProps: stub,
  triggerRef: stub,
  placement: undefined,
})

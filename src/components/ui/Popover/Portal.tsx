import { FloatingPortal } from '@floating-ui/react'

export type IPortalProps = {
  root?: HTMLElement | null | React.MutableRefObject<HTMLElement | null>
  children?: React.ReactNode
  disabled?: boolean
}

export const Portal: React.FC<IPortalProps> = function Portal(props) {
  const { root, children, disabled } = props
  return disabled ? children : <FloatingPortal root={root}>{children}</FloatingPortal>
}

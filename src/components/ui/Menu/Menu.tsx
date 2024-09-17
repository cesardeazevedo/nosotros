import { FloatingTree, useFloatingParentNodeId, type Placement } from '@floating-ui/react'
import type React from 'react'
import { forwardRef } from 'react'
import type { IOrientation } from '../FloatingTransition/FloatingTransition'
import type { SxProps } from '../types'
import { MenuLeaf } from './MenuLeaf'

export type IMenuTriggerRenderProps = {
  opened: boolean
  placement: Placement
  getProps: (userProps?: React.ComponentPropsWithoutRef<'button'>) => Record<string, unknown>
}

export type Props = {
  root?: HTMLElement | null | React.MutableRefObject<HTMLElement | null>
  sx?: SxProps
  disabled?: boolean
  trigger?: React.ReactNode | ((renderProps: IMenuTriggerRenderProps) => React.ReactNode)
  children?: React.ReactNode
  placement?: Placement
  orientation?: IOrientation
  matchTargetWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Menu = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const parentId = useFloatingParentNodeId()

  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuLeaf {...props} ref={ref} />
      </FloatingTree>
    )
  }

  return <MenuLeaf {...props} ref={ref} />
})

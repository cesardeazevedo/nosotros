import { useFloatingTree, useListItem, useMergeRefs } from '@floating-ui/react'
import React, { forwardRef, useContext } from 'react'
import type { Props as ListItemProps } from '../ListItem/ListItem'
import { ListItem } from '../ListItem/ListItem'
import { Menu } from '../Menu/Menu'
import { MenuItemContext } from './MenuItemContext'
import { MenuNestedItem } from './MenuNestedItem'

export type Props = ListItemProps & {
  label: React.ReactNode
  htmlFor?: string
  keepOpenOnClick?: boolean
}

export const MenuItem = forwardRef<HTMLElement, Props>((props, ref) => {
  const { label, children, keepOpenOnClick, ...other } = props
  const menuItemContext = useContext(MenuItemContext)
  const item = useListItem({ label: props.disabled ? null : undefined })
  const tree = useFloatingTree()
  const isActive = item.index === menuItemContext.activeIndex
  const refs = useMergeRefs([item.ref, ref])
  return children ? (
    <Menu trigger={() => <MenuNestedItem label={label} {...other} />}>{children}</Menu>
  ) : (
    <ListItem
      tabIndex={isActive ? 0 : -1}
      {...other}
      onClick={(event) => {
        other.onClick?.(event)
        if (!keepOpenOnClick) {
          tree?.events.emit('click')
        }
      }}
      ref={refs}>
      {label}
    </ListItem>
  )
})

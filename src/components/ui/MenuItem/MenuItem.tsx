import React from 'react'
import type { Props as ListItemProps } from '../ListItem/ListItem'
import { ListItem } from '../ListItem/ListItem'

export type Props = ListItemProps & {
  label: React.ReactNode
  htmlFor?: string
  keepOpenOnClick?: boolean
}

// Dumb component due migration
// TODO: remove this component entirely
export const MenuItem = (props: Props) => {
  const { label, htmlFor, keepOpenOnClick, ...other } = props
  return (
    <ListItem {...other}>
      {label}
    </ListItem>
  )
}

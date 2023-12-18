import { LinkOwnProps, LinkProps } from '@mui/material'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import { User } from 'stores/modules/user.store'
import LinkRouter from './LinkRouter'

interface Props extends Omit<LinkProps, 'color'> {
  user?: User
  color?: LinkOwnProps['color']
  disabled?: boolean
  children: React.ReactNode
}

const LinkProfile = function LinkProfile(props: Props, ref: React.Ref<LinkProps['ref']>) {
  const { user, color = 'inherit', disabled = false, children, ...rest } = props

  if (disabled || !user?.nprofile) {
    return children
  }

  return (
    <Observer>
      {() => (
        <LinkRouter
          to='/$nostr'
          color={color as string}
          params={{ nostr: user?.nprofile }}
          state={{ from: location.pathname }}
          disabled={disabled}
          underline={disabled ? 'none' : 'hover'}
          {...rest}
          ref={ref}>
          {children}
        </LinkRouter>
      )}
    </Observer>
  )
}

export default React.forwardRef(LinkProfile)

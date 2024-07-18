import type { LinkProps } from '@mui/material'
import { type LinkOwnProps } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type User from 'stores/models/user'
import LinkRouter from './LinkRouter'
import { forwardRef } from 'react'

interface Props {
  user?: User
  color?: LinkOwnProps['color']
  underline?: LinkProps['underline']
  disableLink?: boolean
  children: React.ReactNode
}

const LinkProfile = observer(
  forwardRef<never, Props>(function LinkProfile(props, ref) {
    const { user, color = 'inherit', disableLink = false, underline, children, ...rest } = props

    if (disableLink || !user?.nprofile) {
      return children
    }

    return (
      <LinkRouter
        to='/$nostr'
        color={color as string}
        params={{ nostr: user?.nprofile }}
        underline={underline}
        {...rest}
        ref={ref}>
        {children}
      </LinkRouter>
    )
  }),
)

export default LinkProfile

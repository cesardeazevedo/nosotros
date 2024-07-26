import type { LinkProps } from '@mui/material'
import { type LinkOwnProps } from '@mui/material'
import { observer } from 'mobx-react-lite'
import type User from 'stores/models/user'
import LinkRouter from './LinkRouter'
import { forwardRef, useCallback, useContext } from 'react'
import { deckStore } from 'stores/ui/deck.store'
import { useMatch } from '@tanstack/react-router'
import { DeckContext } from '../Deck/DeckList'

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
    const route = useMatch({ strict: false })
    const isDeck = route.id === '/deck'
    const { index } = useContext(DeckContext)

    const handleClickDeck = useCallback(() => {
      if (user) {
        deckStore.addProfileColumn({ pubkey: user.data.pubkey }, index + 1)
      }
    }, [user, index])

    if (disableLink || !user?.nprofile) {
      return children
    }

    if (isDeck) {
      return (
        <LinkRouter
          color={color as string}
          onClick={handleClickDeck}
          underline={underline}
          {...rest}
          ref={ref}>
          {children}
        </LinkRouter>
      )
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

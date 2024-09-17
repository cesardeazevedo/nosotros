import { observer } from 'mobx-react-lite'
import type User from 'stores/models/user'
import type { Props as LinkProps } from './LinkRouter'
import LinkRouter from './LinkRouter'
import { forwardRef, useCallback, useContext } from 'react'
import { deckStore } from 'stores/ui/deck.store'
import { useMatch, useRouter } from '@tanstack/react-router'
import { DeckContext } from '../Deck/DeckContext'
import type { SxProps } from '@/components/ui/types'

interface Props {
  sx?: SxProps
  user?: User
  color?: LinkProps['color']
  underline?: LinkProps['underline']
  disableLink?: boolean
  children: React.ReactNode
}

const LinkProfile = observer(
  forwardRef<never, Props>(function LinkProfile(props, ref) {
    const { sx, user, color, disableLink = false, underline, children, ...rest } = props
    const route = useMatch({ strict: false })
    const router = useRouter()
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
        <LinkRouter color={color} onClick={handleClickDeck} underline={underline} {...rest} ref={ref} sx={sx}>
          {children}
        </LinkRouter>
      )
    }

    return (
      <LinkRouter
        to='/$nostr'
        color={color}
        params={{ nostr: user?.nprofile }}
        // @ts-ignore
        state={{ from: router.latestLocation.pathname }}
        underline={underline}
        sx={sx}
        {...rest}
        ref={ref}>
        {children}
      </LinkRouter>
    )
  }),
)

export default LinkProfile

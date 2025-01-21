import type { SxProps } from '@/components/ui/types'
import { Link, useMatch, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import type { User } from '@/stores/users/user'
import { DeckContext } from '../Deck/DeckContext'
import { useRootStore } from '@/hooks/useRootStore'

interface Props {
  sx?: SxProps
  user?: User
  underline?: boolean
  disableLink?: boolean
  children: React.ReactNode
}

export const LinkProfile = observer(
  forwardRef<never, Props>(function LinkProfile(props, ref) {
    const { user, disableLink = false, underline, children, ...rest } = props
    const route = useMatch({ strict: false })
    const router = useRouter()
    const root = useRootStore()
    const isDeck = route.id === '/deck'
    const { index } = useContext(DeckContext)

    const handleClickDeck = useCallback(() => {
      if (user) {
        root.decks.selected.addNProfile({ pubkey: user.pubkey }, (index || 0) + 1)
      }
    }, [user, index])

    if (disableLink || !user?.nprofile) {
      return children
    }

    if (isDeck) {
      return (
        <Link onClick={handleClickDeck} {...rest} ref={ref} {...css.props([underline && styles.underline, rest.sx])}>
          {children}
        </Link>
      )
    }

    return (
      <Link
        to='/$nostr'
        params={{ nostr: user?.nprofile }}
        // @ts-ignore
        state={{ from: router.latestLocation.pathname }}
        {...rest}
        {...css.props([underline && styles.underline, rest.sx])}
        ref={ref}>
        {children}
      </Link>
    )
  }),
)

const styles = css.create({
  underline: {
    textDecoration: {
      default: 'inherit',
      ':hover': 'underline',
    },
  },
})

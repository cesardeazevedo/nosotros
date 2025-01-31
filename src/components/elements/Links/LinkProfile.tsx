import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { useRootStore } from '@/hooks/useRootStore'
import type { User } from '@/stores/users/user'
import { Link, useMatch, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../Deck/DeckContext'

interface Props {
  sx?: SxProps
  user?: User
  underline?: boolean
  children: React.ReactNode
}

export const LinkProfile = observer(
  forwardRef<never, Props>(function LinkProfile(props, ref) {
    const { user, underline, children, sx, ...rest } = props
    const route = useMatch({ strict: false })
    const router = useRouter()
    const root = useRootStore()
    const isDeck = route.id === '/deck'
    const { index } = useContext(DeckContext)
    const { disableLink } = useContentContext()

    const handleClickDeck = useCallback(() => {
      if (user) {
        root.decks.selected.addNProfile({ options: { pubkey: user.pubkey } }, (index || 0) + 1)
      }
    }, [user, index])

    if (disableLink || !user?.nprofile) {
      return children
    }

    if (isDeck) {
      return (
        <a
          onClick={handleClickDeck}
          {...rest}
          ref={ref}
          {...css.props([styles.cursor, underline && styles.underline, sx])}>
          {children}
        </a>
      )
    }

    return (
      <Link
        resetScroll
        to='/$nostr'
        params={{ nostr: user?.nprofile }}
        state={{ from: router.latestLocation.pathname } as never}
        {...rest}
        {...css.props([underline && styles.underline, sx])}
        ref={ref}>
        {children}
      </Link>
    )
  }),
)

const styles = css.create({
  cursor: {
    cursor: 'pointer',
    display: 'inline',
  },
  underline: {
    textDecoration: {
      default: 'inherit',
      ':hover': 'underline',
    },
  },
})

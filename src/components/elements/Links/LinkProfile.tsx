import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { useRootStore } from '@/hooks/useRootStore'
import { userStore } from '@/stores/users/users.store'
import { Link, useMatch, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { forwardRef, useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../Deck/DeckContext'

interface Props {
  sx?: SxProps
  pubkey: string
  underline?: boolean
  children: React.ReactNode
}

export const LinkProfile = observer(
  forwardRef<never, Props>(function LinkProfile(props, ref) {
    const { pubkey, underline, children, sx, ...rest } = props
    const route = useMatch({ strict: false })
    const router = useRouter()
    const root = useRootStore()
    const isDeck = route.id === '/deck'
    const { index } = useContext(DeckContext)
    const { disableLink } = useContentContext()

    const nprofile = userStore.get(pubkey)?.nprofile || nip19.nprofileEncode({ pubkey })

    const handleClickDeck = useCallback(() => {
      root.decks.selected.addNProfile({ options: { pubkey } }, (index || 0) + 1)
    }, [index])

    if (disableLink || !nprofile) {
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
        params={{ nostr: nprofile }}
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

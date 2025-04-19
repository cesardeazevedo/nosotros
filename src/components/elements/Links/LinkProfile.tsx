import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { useRootStore } from '@/hooks/useRootStore'
import { createNProfileModule } from '@/stores/modules/module.helpers'
import { userStore } from '@/stores/users/users.store'
import { encodeSafe } from '@/utils/nip19'
import { Link, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { forwardRef, useCallback, useContext, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../../modules/Deck/DeckContext'

interface Props {
  sx?: SxProps
  pubkey: string
  underline?: boolean
  children: React.ReactNode
}

export const LinkProfile = observer(
  forwardRef<never, Props>(function LinkProfile(props, ref) {
    const { pubkey, underline, children, sx, ...rest } = props
    const router = useRouter()
    const root = useRootStore()
    const { disableLink } = useContentContext()
    const { index } = useContext(DeckContext)
    const isDeck = index !== undefined

    const nprofile = useMemo(() => {
      return userStore.get(pubkey)?.nprofile || encodeSafe(() => nip19.nprofileEncode({ pubkey }))
    }, [])

    const handleClickDeck = useCallback(() => {
      root.decks.selected.add(createNProfileModule(pubkey), (index || 0) + 1)
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

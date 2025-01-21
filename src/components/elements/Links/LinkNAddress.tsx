import { useRootStore } from '@/hooks/useRootStore'
import { decodeNIP19 } from '@/utils/nip19'
import { Link, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import type { NAddr } from 'nostr-tools/nip19'
import React, { useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../Deck/DeckContext'

export type Props = {
  naddress: NAddr | undefined
  children: React.ReactNode
  underline?: boolean
  disableLink?: boolean
}

export const LinkNAddress = observer(function LinkNAddress(props: Props) {
  const { naddress, disableLink, underline, ...rest } = props
  const router = useRouter()
  const root = useRootStore()
  const { index } = useContext(DeckContext)

  const handleClickDeck = useCallback(() => {
    if (naddress) {
      const decoded = decodeNIP19(naddress)
      if (decoded?.type === 'naddr') {
        root.decks.selected.addNAddr({ options: decoded.data }, (index || 0) + 1)
      }
    }
  }, [naddress, index])

  if (disableLink || !naddress) {
    return props.children
  }

  if (index !== undefined) {
    return (
      <Link onClick={handleClickDeck} {...rest}>
        {props.children}
      </Link>
    )
  }

  return (
    <Link
      to={`/$nostr`}
      // @ts-ignore
      state={{ from: router.latestLocation.pathname }}
      {...rest}
      {...css.props([underline && styles.underline])}
      params={{ nostr: naddress }}>
      {props.children}
    </Link>
  )
})

const styles = css.create({
  underline: {
    textDecoration: {
      default: 'inherit',
      ':hover': 'underline',
    },
  },
})

import { useRootStore } from '@/hooks/useRootStore'
import { createRelayFeedModule } from '@/stores/modules/module.helpers'
import type { LinkProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import React, { useContext } from 'react'
import { DeckContext } from '../../modules/Deck/DeckContext'

type Props = Omit<LinkProps, 'to' | 'search'> & {
  url: string
  children: React.ReactNode
}

export const LinkRelayFeed = (props: Props) => {
  const { url, target = '_self' } = props
  const root = useRootStore()
  const router = useRouter()
  const { index } = useContext(DeckContext)
  const isDeck = index !== undefined

  if (isDeck) {
    return (
      <a
        onClick={(e) => {
          root.decks.selected.add(createRelayFeedModule([url]), index + 1)
          e.preventDefault()
          e.stopPropagation()
        }}>
        {props.children}
      </a>
    )
  }

  return (
    <Link
      to={`/feed`}
      target={target}
      search={{ relay: url, kind: 1, limit: 50, type: 'relayfeed' }}
      state={{ from: router.latestLocation.pathname } as never}>
      {props.children}
    </Link>
  )
}

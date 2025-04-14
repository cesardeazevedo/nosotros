import { useRootStore } from '@/hooks/useRootStore'
import { createRelayFeedModule } from '@/stores/modules/module.helpers'
import { Link, useRouter } from '@tanstack/react-router'
import React, { useContext } from 'react'
import { DeckContext } from '../../modules/Deck/DeckContext'

type Props = {
  url: string
  children: React.ReactNode
}

export const LinkRelayFeed = (props: Props) => {
  const { url } = props
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
      target='_blank'
      search={{ relay: url, kind: 1, limit: 50 }}
      state={{ from: router.latestLocation.pathname } as never}>
      {props.children}
    </Link>
  )
}

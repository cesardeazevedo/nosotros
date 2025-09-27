import { ArticleFeedItem } from '@/components/modules/Articles/ArticleFeedItem'
import { FollowEventRoot } from '@/components/modules/Follows/FollowEventRoot'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { PostQuote } from '../Posts/PostQuote'
import { UserRoot } from '../User/UserRoot'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupportedContent } from './NostrEventUnsupportedContent'
import { StarterPackCard } from '@/components/modules/Lists/StarterPacks/StarterPackCard'
import { Paper } from '@/components/ui/Paper/Paper'

type Props = {
  event: NostrEventDB
}

export const NostrEventQuote = memo(function NostrEventQuote(props: Props) {
  const { event } = props
  switch (event.kind) {
    case Kind.Metadata: {
      return (
        <Paper outlined>
          <UserRoot pubkey={event.pubkey} />
        </Paper>
      )
    }
    case Kind.Article: {
      return (
        <Paper outlined>
          <ArticleFeedItem event={event} />
        </Paper>
      )
    }
    case Kind.Text:
    case Kind.Media:
    case Kind.Comment: {
      return <PostQuote event={event} />
    }
    case Kind.Follows: {
      return (
        <Paper outlined>
          <FollowEventRoot event={event} />
        </Paper>
      )
    }
    case Kind.ZapReceipt: {
      return (
        <Paper outlined>
          <ZapReceiptRoot event={event} />
        </Paper>
      )
    }
    case Kind.StarterPack: {
      return <StarterPackCard event={event} />
    }
    default: {
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupportedContent event={event} />
    }
  }
})

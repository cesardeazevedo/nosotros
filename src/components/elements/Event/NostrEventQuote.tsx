import { ArticleRoot } from '@/components/modules/Articles/ArticleRoot'
import { FollowEventRoot } from '@/components/modules/Follows/FollowEventRoot'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { PostQuote } from '../Posts/PostQuote'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  event: NostrEventDB
}

export const NostrEventQuote = memo(function NostrEventQuote(props: Props) {
  const { event } = props
  switch (event.kind) {
    case Kind.Article: {
      return <ArticleRoot event={event} />
    }
    case Kind.Text: {
      return <PostQuote event={event} />
    }
    case Kind.Follows: {
      return <FollowEventRoot event={event} />
    }
    case Kind.Comment: {
      return <PostQuote event={event} />
    }
    case Kind.Media: {
      return <PostQuote event={event} />
    }
    case Kind.ZapReceipt: {
      // Ideally we would render a specific component for quotes, but zap root is fine here
      return <ZapReceiptRoot event={event} />
    }
    default: {
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupported event={event} />
    }
  }
})

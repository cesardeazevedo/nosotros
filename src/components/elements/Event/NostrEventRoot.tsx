import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { PostRoot } from '../Posts/Post'
import { RepostRoot } from '../Repost/Repost'
import { Threads } from '../Threads/Threads'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'
import { PublicMessageRoot } from '../PublicMessage/PublicMessageRoot'

type Props = {
  event: NostrEventDB
  open?: boolean
}

export const NostrEventRoot = memo(function NostrEventRoot(props: Props) {
  const { event, open } = props
  switch (event.kind) {
    case Kind.Comment:
    case Kind.Text: {
      return event.metadata?.isRoot ? (
        <PostRoot event={event} open={open} />
      ) : (
        <Threads event={event} renderRepliesSummary />
      )
    }
    case Kind.PublicMessage:
    case Kind.Article: {
      return <PublicMessageRoot event={event} />
    }
    case Kind.Repost: {
      return <RepostRoot event={event} />
    }
    case Kind.Media: {
      return <PostRoot open={open} event={event} />
    }
    case Kind.ZapReceipt: {
      return <ZapReceiptRoot event={event} />
    }
    default: {
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupported event={event} />
    }
  }
})

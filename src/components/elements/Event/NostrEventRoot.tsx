import { Kind } from '@/constants/kinds'
import type { NostrEventMetadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { observer } from 'mobx-react-lite'
import { PostRoot } from '../Posts/Post'
import { RepliesThread } from '../Replies/RepliesThread'
import { RepostRoot } from '../Repost/Repost'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  event: NostrEventMetadata
  open?: boolean
}

export const NostrEventRoot = observer(function NostrEventRoot(props: Props) {
  const { event, open } = props
  switch (event.kind) {
    case Kind.Comment:
    case Kind.Text: {
      return event[metadataSymbol].isRoot ? (
        <PostRoot event={event} open={open} />
      ) : (
        <RepliesThread event={event} open={open} />
      )
    }
    case Kind.Article: {
      return <PostRoot event={event} open={open} />
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

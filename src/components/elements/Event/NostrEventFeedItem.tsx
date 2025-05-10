import { ArticleRoot } from '@/components/modules/Articles/ArticleRoot'
import { Kind } from '@/constants/kinds'
import type { NostrEventMetadata } from '@/nostr/types'
import { observer } from 'mobx-react-lite'
import { PostRoot } from '../Posts/Post'
import { RepostRoot } from '../Repost/Repost'
import { UserRoot } from '../User/UserRoot'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  event: NostrEventMetadata
}

export const NostrEventFeedItem = observer(function NostrEventFeedItem(props: Props) {
  const { event } = props

  switch (event.kind) {
    case Kind.Metadata: {
      return <UserRoot event={event} />
    }
    case Kind.Text: {
      return <PostRoot event={event} />
    }
    case Kind.Article: {
      return <ArticleRoot event={event} />
    }
    case Kind.Repost: {
      return <RepostRoot event={event} />
    }
    case Kind.Media: {
      return <PostRoot event={event} />
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

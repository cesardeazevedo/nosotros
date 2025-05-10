import { ArticleRoot } from '@/components/modules/Articles/ArticleRoot'
import { Kind } from '@/constants/kinds'
import type { NostrEventMetadata } from '@/nostr/types'
import { observer } from 'mobx-react-lite'
import { PostQuote } from '../Posts/PostQuote'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  event: NostrEventMetadata
}

export const NostrEventQuote = observer(function NostrEventQuote(props: Props) {
  const { event } = props
  switch (event.kind) {
    case Kind.Article: {
      return <ArticleRoot event={event} />
    }
    case Kind.Text: {
      return <PostQuote event={event} />
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

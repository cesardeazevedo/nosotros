import { Kind } from '@/constants/kinds'
import type {
  NostrEventComment,
  NostrEventMedia,
  NostrEventNote,
  NostrEventRepost,
  NostrEventZapReceipt,
} from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { observer } from 'mobx-react-lite'
import { ArticleRoot } from '../Articles/ArticleRoot'
import { PostQuote } from '../Posts/PostQuote'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  event: NostrEventNote | NostrEventComment | NostrEventZapReceipt | NostrEventRepost | NostrEventMedia
}

export const NostrEventQuote = observer(function NostrEventQuote(props: Props) {
  const { event } = props
  switch (event[metadataSymbol].kind) {
    case Kind.Article: {
      return <ArticleRoot event={event as NostrEventNote} />
    }
    case Kind.Text: {
      return <PostQuote event={event as NostrEventNote} />
    }
    case Kind.Comment: {
      return <PostQuote event={event as NostrEventComment} />
    }
    case Kind.Media: {
      return <PostQuote event={event as NostrEventMedia} />
    }
    case Kind.ZapReceipt: {
      // Ideally we would render a specific component for quotes, but zap root is fine here
      return <ZapReceiptRoot event={event as NostrEventZapReceipt} />
    }
    default: {
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupported event={event} />
    }
  }
})

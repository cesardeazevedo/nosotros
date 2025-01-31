import { Kind } from '@/constants/kinds'
import type { NostrEventMetadata, NostrEventNote, NostrEventRepost, NostrEventZapReceipt } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { observer } from 'mobx-react-lite'
import { PostRoot } from '../Posts/Post'
import { PostThread } from '../Posts/PostThread'
import { RepostRoot } from '../Repost/Repost'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  event: NostrEventMetadata
  open?: boolean
}

export const NostrEventRoot = observer(function NostrEventRoot(props: Props) {
  const { event, open } = props
  switch (event[metadataSymbol].kind) {
    case Kind.Text: {
      return event[metadataSymbol].isRoot ? (
        <PostRoot event={event as NostrEventNote} open={open} />
      ) : (
        <PostThread event={event as NostrEventNote} open={open} />
      )
    }
    case Kind.Article: {
      return <PostRoot event={event as NostrEventNote} open={open} />
    }
    case Kind.Repost: {
      return <RepostRoot event={event as NostrEventRepost} />
    }
    case Kind.ZapReceipt: {
      return <ZapReceiptRoot event={event as NostrEventZapReceipt} />
    }
    default: {
      console.log('Unhandled item to render', event)
      return <NostrEventUnsupported event={event} />
    }
  }
})

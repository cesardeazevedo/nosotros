import { NostrProvider } from '@/components/providers/NostrProvider'
import { Kind } from '@/constants/kinds'
import type {
  NostrEventMedia,
  NostrEventMetadata,
  NostrEventNote,
  NostrEventRepost,
  NostrEventZapReceipt,
} from '@/nostr/types'
import { metadataSymbol, READ } from '@/nostr/types'
import { NostrStoreModel } from '@/stores/nostr/nostr.context.store'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { ArticleRoot } from '../Articles/ArticleRoot'
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

  const getRoot = () => {
    switch (event[metadataSymbol].kind) {
      case Kind.Metadata: {
        return <UserRoot event={event as NostrEventMetadata} />
      }
      case Kind.Text: {
        return <PostRoot event={event as NostrEventNote} />
      }
      case Kind.Article: {
        return <ArticleRoot event={event as NostrEventNote} />
      }
      case Kind.Repost: {
        return <RepostRoot event={event as NostrEventRepost} />
      }
      case Kind.Media: {
        return <PostRoot event={event as NostrEventMedia} />
      }
      case Kind.ZapReceipt: {
        return <ZapReceiptRoot event={event as NostrEventZapReceipt} />
      }
      default: {
        console.log('Unhandled item to render', event)
        return <NostrEventUnsupported event={event} />
      }
    }
  }
  const root = getRoot()
  const nostrContext = useMemo(() => NostrStoreModel.create({ pubkey: event.pubkey, permission: READ }), [])
  return (
    <NostrProvider initializeRelays={false} nostrContext={() => nostrContext}>
      {root}
    </NostrProvider>
  )
})

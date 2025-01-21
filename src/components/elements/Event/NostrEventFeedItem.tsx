import { Kind } from '@/constants/kinds'
import { modelStore } from '@/stores/base/model.store'
import { Note } from '@/stores/notes/note'
import { Repost } from '@/stores/reposts/repost'
import { ZapReceipt } from '@/stores/zaps/zap.receipt.store'
import { observer } from 'mobx-react-lite'
import type { NostrEvent } from 'nostr-tools'
import { ArticleRoot } from '../Articles/ArticleRoot'
import { PostRoot } from '../Posts/Post'
import { RepostRoot } from '../Repost/Repost'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  event: NostrEvent
}

export const NostrEventFeedItem = observer(function NostrEventFeedItem(props: Props) {
  const { event } = props
  const item = modelStore.get(event.id)
  if (item) {
    switch (true) {
      case item instanceof Note: {
        return item.event.kind === Kind.Article ? <ArticleRoot note={item} /> : <PostRoot note={item} />
      }
      case item instanceof Repost: {
        return <RepostRoot repost={item} />
      }
      case item instanceof ZapReceipt: {
        return <ZapReceiptRoot zap={item} />
      }
      default: {
        console.log('Unhandled item to render', event)
        return <NostrEventUnsupported event={'event' in item ? item.event : item} />
      }
    }
  }
})

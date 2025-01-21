import type { ModelEvent } from '@/stores/base/model.store'
import { Note } from '@/stores/notes/note'
import { Repost } from '@/stores/reposts/repost'
import { ZapReceipt } from '@/stores/zaps/zap.receipt.store'
import { observer } from 'mobx-react-lite'
import { PostRoot } from '../Posts/Post'
import { PostThread } from '../Posts/PostThread'
import { RepostRoot } from '../Repost/Repost'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'
import { Kind } from '@/constants/kinds'

type Props = {
  item: ModelEvent
}

export const NostrEventRoot = observer(function NostrEventRoot(props: Props) {
  const { item } = props
  switch (true) {
    case item instanceof Note: {
      return item.metadata.isRoot || item.event.kind === Kind.Article ? (
        <PostRoot note={item} />
      ) : (
        <PostThread note={item} />
      )
    }
    case item instanceof Repost: {
      return <RepostRoot repost={item} />
    }
    case item instanceof ZapReceipt: {
      return <ZapReceiptRoot zap={item} />
    }
    default: {
      console.log('Unhandled item to render', item)
      return <NostrEventUnsupported event={'event' in item ? item.event : item} />
    }
  }
})

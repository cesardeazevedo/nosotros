import { modelStore } from '@/stores/base/model.store'
import { Note } from '@/stores/notes/note'
import { Repost } from '@/stores/reposts/repost'
import { ZapReceipt } from '@/stores/zaps/zap.receipt.store'
import { observer } from 'mobx-react-lite'
import { PostQuote } from '../Posts/PostQuote'
import { RepostHeader } from '../Repost/RepostHeader'
import { ZapReceiptRoot } from '../Zaps/ZapReceipt'
import { NostrEventUnsupported } from './NostrEventUnsupported'

type Props = {
  id: string
}

export const NostrEventQuote = observer(function NostrEventQuote(props: Props) {
  const { id } = props
  const item = modelStore.get(id)
  if (item) {
    switch (true) {
      case item instanceof Note: {
        return <PostQuote note={item} />
      }
      case item instanceof Repost: {
        // Quote reposts shouldn't really happen
        return <PostQuote header={<RepostHeader repost={item} />} note={item.note} />
      }
      case item instanceof ZapReceipt: {
        // Ideally we would render a specific component for quotes, but zap root is fine here
        return <ZapReceiptRoot zap={item} />
      }
      default: {
        console.log('Unhandled item to render', item)
        return <NostrEventUnsupported event={'event' in item ? item.event : item} />
      }
    }
  }
})

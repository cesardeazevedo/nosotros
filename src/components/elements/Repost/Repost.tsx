import type { NostrEventMetadata } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { eventStore } from '@/stores/events/event.store'
import { observer } from 'mobx-react-lite'
import { PostRoot } from '../Posts/Post'
import { RepostHeader } from './RepostHeader'

type Props = {
  event: NostrEventMetadata
}

export const RepostRoot = observer(function RepostRoot(props: Props) {
  const { event } = props
  const refEvent = eventStore.get(event[metadataSymbol].mentionedNotes?.[0])?.event
  return refEvent && <PostRoot event={refEvent} header={<RepostHeader event={event} />} />
})

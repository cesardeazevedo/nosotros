import { Kind } from '@/constants/kinds'
import type { Event } from '@/stores/events/event'
import type { FeedModuleSnapshotIn } from '@/stores/modules/feed.module'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

type Props = LinkProps & {
  event: Event
  onClick?: (snapshot: FeedModuleSnapshotIn) => void
}

export const RelaySetLink = (props: Props) => {
  const { event, onClick, ...rest } = props
  const d = event.getTag('d')
  const relaySets = [event.pubkey, d].join(':')
  return (
    <Link
      to='/feed'
      search={{
        relaySets,
        limit: 30,
        kind: [Kind.Text, Kind.Repost],
        type: 'relaysets',
      }}
      disabled={!!onClick}
      onClick={() =>
        onClick?.({
          type: 'relaysets',
          feed: {
            filter: {
              kinds: [Kind.Text, Kind.Repost],
              limit: 30,
            },
            scope: 'self',
            context: {
              relaySets: [relaySets],
            },
          },
        })
      }
      {...rest}
    />
  )
}

import { Kind } from '@/constants/kinds'
import type { Event } from '@/stores/events/event'
import type { FeedModuleSnapshotIn } from '@/stores/modules/feed.module'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

type Props = LinkProps & {
  event: Event
  onClick?: (snapshot: FeedModuleSnapshotIn) => void
}

export const StarterPackLink = (props: Props) => {
  const { event, onClick, ...rest } = props
  const d = event.getTag('d') || ''
  const kinds = [Kind.StarterPack, Kind.Text, Kind.Article]
  return (
    <Link
      to='/feed'
      search={{
        kind: kinds,
        scope: 'sets_p',
        limit: 20,
        type: 'starterpack',
        author: [event.pubkey],
        d,
      }}
      {...rest}
      disabled={!!onClick}
      onClick={() =>
        onClick?.({
          type: 'starterpack',
          feed: {
            scope: 'sets_p',
            filter: {
              kinds,
              limit: 20,
              authors: [event.pubkey],
              '#d': [d],
            },
            context: {},
          },
        })
      }
    />
  )
}

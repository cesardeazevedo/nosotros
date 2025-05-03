import { Kind } from '@/constants/kinds'
import type { Event } from '@/stores/events/event'
import type { FeedModuleSnapshotIn } from '@/stores/modules/feed.module'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'

type Props = LinkProps & {
  event: Event
  onClick?: (snapshot: FeedModuleSnapshotIn) => void
}

export const FollowSetLink = observer(function FollowSetLink(props: Props) {
  const { event, children, onClick, ...rest } = props
  const kinds = [Kind.FollowSets, Kind.Text, Kind.Repost]
  const pubkey = event.pubkey
  const d = event.getTag('d') || ''

  return (
    <Link
      to='/feed'
      search={{
        scope: 'sets_p',
        author: event.pubkey,
        d: event.getTag('d'),
        type: 'followset',
        kind: kinds,
        limit: 20,
      }}
      disabled={!!onClick}
      onClick={() =>
        onClick?.({
          type: 'followset',
          feed: {
            filter: {
              kinds,
              authors: [pubkey],
              '#d': [d],
              limit: 20,
            },
            scope: 'sets_p',
            context: {},
          },
        })
      }
      {...rest}>
      {children}
    </Link>
  )
})

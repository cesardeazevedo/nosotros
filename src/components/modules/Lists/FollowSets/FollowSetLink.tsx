import { Kind } from '@/constants/kinds'
import type { Event } from '@/stores/events/event'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

type Props = LinkProps & {
  event: Event
}

export const FollowSetLink = (props: Props) => {
  const { event, ...rest } = props
  return (
    <Link
      to='/feed'
      search={{
        scope: 'followset',
        author: event.pubkey,
        d: event.getTag('d'),
        type: 'followset',
        kind: [Kind.Text, Kind.Repost],
        limit: 50,
      }}
      {...rest}
    />
  )
}

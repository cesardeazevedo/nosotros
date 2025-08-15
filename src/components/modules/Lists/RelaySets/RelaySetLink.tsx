import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useEventTag } from '@/hooks/useEventUtils'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

type Props = LinkProps & {
  event: NostrEventDB
  onClick?: (feed: FeedModule) => void
}

export const RelaySetLink = (props: Props) => {
  const { event, onClick, ...rest } = props
  const d = useEventTag(event, 'd')
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
      onClick={() => {
        // onClick?.({
        //   type: 'relaysets',
        //   filter: {
        //     kinds: [Kind.Text, Kind.Repost],
        //     limit: 30,
        //   },
        //   scope: 'self',
        //   ctx: {
        //     // relaySets: [relaySets],
        //   },
        // })
      }}
      {...rest}
    />
  )
}

import type { Event } from '@/stores/events/event'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

type Props = LinkProps & {
  event: Event
}

export const RelaySetLink = (props: Props) => {
  const { event, ...rest } = props
  const d = event.getTag('d')
  return (
    <Link
      to='/feed'
      search={{
        relaySets: [event.pubkey, d].join(':'),
        limit: 50,
        type: 'relaysets',
      }}
      {...rest}
    />
  )
}

import { nip19 } from 'nostr-tools'
import { useMemo } from 'react'
import { NostrRoute } from './NostrRoute'

type Props = {
  nostr: string
}

export const NostrRouteParallel = (props: Props) => {
  const { nostr } = props
  const decoded = useMemo(() => nip19.decode(nostr), [nostr])
  return <NostrRoute masked nostr={nostr} decoded={decoded} />
}

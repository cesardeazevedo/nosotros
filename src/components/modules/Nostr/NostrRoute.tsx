import { NostrEventRoute } from '../NostrEvent/NostrEventRoute'
import { NProfileRoute } from '../NProfile/NProfileRoute'
import type { DecodedResult } from 'nostr-tools/nip19'
import { NProfileRouteMasked } from '../NProfile/NProfileRouteMasked'

type Props = {
  nostr: string
  decoded: DecodedResult | undefined
  masked?: boolean
}

// Selects which Nostr route to render based on the decoded NIP-19 type
export const NostrRoute = (props: Props) => {
  const { decoded, nostr, masked } = props
  switch (decoded?.type) {
    case 'npub':
      return <NProfileRoute pubkey={decoded.data} />
    case 'nprofile': {
      if (masked) {
        return <NProfileRouteMasked pubkey={decoded.data.pubkey} nostr={nostr} />
      }
      return <NProfileRoute pubkey={decoded.data.pubkey} />
    }
    case 'note':
    case 'nevent':
    case 'naddr': {
      return <NostrEventRoute nip19={nostr} />
    }
    default: {
      return null
    }
  }
}

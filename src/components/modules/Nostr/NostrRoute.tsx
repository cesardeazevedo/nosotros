import { Kind } from '@/constants/kinds'
import { queryKeys } from '@/hooks/query/queryKeys'
import { addressFromNIP19 } from '@/utils/nip19'
import { useQueryClient } from '@tanstack/react-query'
import type { DecodedResult } from 'nostr-tools/nip19'
import { useEffect } from 'react'
import { NostrEventRoute } from '../NostrEvent/NostrEventRoute'
import { NProfileRoute } from '../NProfile/NProfileRoute'
import { NProfileRouteMasked } from '../NProfile/NProfileRouteMasked'

type Props = {
  nostr: string
  decoded: DecodedResult | undefined
  masked?: boolean
}

// Selects which Nostr route to render based on the decoded NIP-19 type
export const NostrRoute = (props: Props) => {
  const { decoded, nostr, masked } = props
  const queryClient = useQueryClient()

  useEffect(() => {
    switch (decoded?.type) {
      case 'note': {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tag('e', [decoded.data], Kind.Text),
        })
        break
      }
      case 'nevent': {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tag('e', [decoded.data.id], Kind.Text),
        })
        break
      }
      case 'naddr': {
        const address = addressFromNIP19(decoded.data)
        queryClient.invalidateQueries({
          queryKey: queryKeys.tag('a', [address], Kind.Text),
        })
        break
      }
    }
  }, [decoded, nostr])

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

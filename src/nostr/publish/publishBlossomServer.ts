import { Kind } from '@/constants/kinds'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { Signer } from '@/core/signers/signer'
import { subscribeLastEvent } from '@/hooks/subscriptions/subscribeLast'
import { mergeMap } from 'rxjs'
import { publish } from './publish'

export function publishBlossomServer(url: string, pubkey: string, signer: Signer) {
  const formattedUrl = formatRelayUrl(url)
  const filter = { kinds: [Kind.BlossomServerList], authors: [pubkey] }
  return subscribeLastEvent({}, filter).pipe(
    mergeMap((event) => {
      const exists = event?.tags?.find((x) => x[1] === url) || false
      const newEvent = {
        kind: Kind.BlossomServerList,
        content: '',
        pubkey,
        tags:
          exists && event
            ? event.tags.filter((x) => formatRelayUrl(x[1]) !== formattedUrl)
            : [...(event?.tags || []), ['server', formattedUrl]],
      }
      return publish(newEvent, { signer })
    }),
  )
}

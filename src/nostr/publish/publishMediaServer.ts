import type { Kind } from '@/constants/kinds'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { Signer } from '@/core/signers/signer'
import { subscribeLastEvent } from '@/hooks/subscriptions/subscribeLast'
import { mergeMap } from 'rxjs'
import { publish } from './publish'

export function publishMediaServer(
  kind: Kind.BlossomServerList | Kind.NIP96ServerList,
  url: string,
  pubkey: string,
  signer: Signer,
) {
  const formattedUrl = formatRelayUrl(url)
  const filter = { kinds: [kind], authors: [pubkey] }
  return subscribeLastEvent({ network: 'REMOTE_ONLY' }, filter).pipe(
    mergeMap((event) => {
      const exists = event?.tags?.find((x) => x[1] === url) || false
      const newEvent = {
        kind,
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

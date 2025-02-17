import { Kind } from '@/constants/kinds'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { EMPTY, mergeMap } from 'rxjs'
import type { NostrContext } from '../context'
import { subscribeLast } from '../subscriptions/subscribeLast'
import { publish } from './publish'

export function publishBlossomServer(url: string, ctx: NostrContext) {
  if (!ctx.pubkey) return EMPTY

  const formattedUrl = formatRelayUrl(url)
  return subscribeLast({ kinds: [Kind.BlossomServerList], authors: [ctx.pubkey] }, ctx).pipe(
    mergeMap((event) => {
      const exists = event?.tags?.find((x) => x[1] === url) || false
      const newEvent = {
        kind: Kind.BlossomServerList,
        content: '',
        tags:
          exists && event
            ? // Server already exists, remove it
              event.tags.filter((x) => formatRelayUrl(x[1]) !== formattedUrl)
            : // Add new server
              [...(event?.tags || []), ['server', formattedUrl]],
      }
      return publish(ctx, newEvent)
    }),
  )
}

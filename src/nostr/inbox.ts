import type { NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { combineLatestWith, map, mergeMap, of } from 'rxjs'
import { isAuthorTag } from './helpers/tags'
import type { RelaySelectionConfig } from './operators/fromUserRelays'
import { trackUsersRelays } from './operators/trackUserRelays'

interface InboxConfig extends RelaySelectionConfig {
  ignoreRelays: Observable<string[]>
}

const defaultConfig = {
  maxRelaysPerUser: 10,
} as InboxConfig

export function inbox(config: InboxConfig = defaultConfig) {
  const options = Object.assign({}, defaultConfig, config)

  return (event: NostrEvent) => {
    return of(event).pipe(
      combineLatestWith(config.ignoreRelays.pipe(map((x) => new Set(x)))),

      mergeMap(([event, ignoreRelays]) => {
        const relaySelection: RelaySelectionConfig = {
          ignore: ignoreRelays,
          permission: 'write',
          maxRelaysPerUser: options.maxRelaysPerUser,
        }

        const author = event.pubkey
        const related = event.tags.filter((tag) => isAuthorTag(tag)).flatMap((tag) => tag[1])

        const authors = [author, ...related]

        return trackUsersRelays(authors, relaySelection).pipe(map((x) => x[1]))
      }),
    )
  }
}

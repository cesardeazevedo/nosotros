import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { mergeMap, of } from 'rxjs'
import { parseArticle } from '../helpers/parseArticle'
import { parseFollowList } from '../helpers/parseFollowList'
import { parseNote } from '../helpers/parseNote'
import { parseRelayList } from '../helpers/parseRelayList'
import { parseRepost } from '../helpers/parseRepost'
import { parseUser } from '../helpers/parseUser'
import { parseZapEvent } from '../helpers/parseZap'
import { mergeMetadata, persistMetadata } from './mapMetadata'
import { parseRelayDiscovery } from '../helpers/parseRelayDiscovery'

export function parseEventMetadata() {
  return (source$: Observable<NostrEvent>) => {
    return source$.pipe(
      mergeMap((event) => {
        switch (event.kind) {
          case Kind.Metadata: {
            return of(event).pipe(persistMetadata(parseUser))
          }
          case Kind.Text: {
            return of(event).pipe(persistMetadata(parseNote))
          }
          case Kind.Article: {
            return of(event).pipe(persistMetadata(parseArticle))
          }
          case Kind.Follows: {
            return of(event).pipe(mergeMetadata(parseFollowList))
          }
          case Kind.Repost: {
            return of(event).pipe(mergeMetadata(parseRepost))
          }
          case Kind.RelayList: {
            return of(event).pipe(mergeMetadata(parseRelayList))
          }
          case Kind.ZapReceipt: {
            return of(event).pipe(persistMetadata(parseZapEvent))
          }
          case Kind.RelayDiscovery: {
            return of(event).pipe(mergeMetadata(parseRelayDiscovery))
          }
          default: {
            // to guarantee types
            return of(event).pipe(mergeMetadata((x) => ({ id: x.id, kind: x.kind })))
          }
        }
      }),
    )
  }
}

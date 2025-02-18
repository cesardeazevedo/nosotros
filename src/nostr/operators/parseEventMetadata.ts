import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { mergeMap, of } from 'rxjs'
import { parseArticle } from '../helpers/parseArticle'
import { parseComment } from '../helpers/parseComment'
import { parseFollowList } from '../helpers/parseFollowList'
import { parseMedia } from '../helpers/parseMedia'
import { parseNote } from '../helpers/parseNote'
import { parseRelayDiscovery } from '../helpers/parseRelayDiscovery'
import { parseRelayList } from '../helpers/parseRelayList'
import { parseRepost } from '../helpers/parseRepost'
import { parseUser } from '../helpers/parseUser'
import { parseZapEvent } from '../helpers/parseZap'
import { parseMetadata } from './parseMetadata'
import { persistMetadata } from './persistMetadata'

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
          case Kind.Comment: {
            return of(event).pipe(persistMetadata(parseComment))
          }
          case Kind.Article: {
            return of(event).pipe(persistMetadata(parseArticle))
          }
          case Kind.Follows: {
            return of(event).pipe(parseMetadata(parseFollowList))
          }
          case Kind.Repost: {
            return of(event).pipe(parseMetadata(parseRepost))
          }
          case Kind.Media: {
            return of(event).pipe(persistMetadata(parseMedia))
          }
          case Kind.RelayList: {
            return of(event).pipe(parseMetadata(parseRelayList))
          }
          case Kind.ZapReceipt: {
            return of(event).pipe(persistMetadata(parseZapEvent))
          }
          case Kind.RelayDiscovery: {
            return of(event).pipe(parseMetadata(parseRelayDiscovery))
          }
          default: {
            // to guarantee types
            return of(event).pipe(parseMetadata((x) => ({ id: x.id, kind: x.kind })))
          }
        }
      }),
    )
  }
}

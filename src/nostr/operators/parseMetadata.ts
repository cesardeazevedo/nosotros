import { Kind } from '@/constants/kinds'
import type { NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { mergeMap, of } from 'rxjs'
import { parseFollowList } from '../helpers/parseFollowList'
import { parseRelayList } from '../helpers/parseRelayList'
import { parseRepost } from '../helpers/parseRepost'
import { parseZapEvent } from '../helpers/parseZap'
import { parseNote } from '../nips/nip01/metadata/parseNote'
import { parseUser } from '../nips/nip01/metadata/parseUser'
import { mergeMetadata, persistMetadata } from './mapMetadata'

export function parseEventMetadata() {
  return (source$: Observable<NostrEvent>) => {
    return source$.pipe(
      mergeMap((event) => {
        switch (event.kind) {
          case Kind.Metadata: {
            return of(event).pipe(persistMetadata(parseUser))
          }
          case Kind.Text:
          case Kind.Article: {
            return of(event).pipe(persistMetadata(parseNote))
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
          default: {
            // to guarantee types
            return of(event).pipe(mergeMetadata((x) => ({ id: x.id, kind: x.kind })))
          }
        }
      }),
    )
  }
}

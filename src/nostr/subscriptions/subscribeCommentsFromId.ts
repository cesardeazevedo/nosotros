import { Kind } from '@/constants/kinds'
import { ofKind } from '@/core/operators/ofKind'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventComment, NostrEventNote } from '../types'

const replay = new ShareReplayCache<NostrEventNote | NostrEventComment>()

const kinds = [Kind.Comment]

export const subscribeCommentsFromId = replay.wrap(
  (_id: string, filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) => {
    return client
      .subscribe({ ...filter, kinds }, options)
      .pipe(ofKind<NostrEventComment>(kinds), client.notes.withRelatedNotes(options))
  },
)

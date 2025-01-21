import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { ClientSubOptions, NostrClient } from '../nostr'
import { ShareReplayCache } from '../replay'
import type { NostrEventComment, NostrEventNote } from '../types'

const replay = new ShareReplayCache<NostrEventNote | NostrEventComment>()

const kinds = [Kind.Text]

// NIP-10 replies
export const subscribeRepliesFromId = replay.wrap(
  (_id: string, filter: NostrFilter, client: NostrClient, options?: ClientSubOptions) => {
    return client.notes.subNotesWithRelated({ ...filter, kinds }, options)
  },
)

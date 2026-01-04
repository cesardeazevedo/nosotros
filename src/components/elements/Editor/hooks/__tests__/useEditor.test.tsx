import { Kind } from '@/constants/kinds'
import { RELAY_1, RELAY_2, RELAY_3 } from '@/constants/testRelays'
import { queryClient } from '@/hooks/query/queryClient'
import { eventToQueryKey, queryKeys } from '@/hooks/query/queryKeys'
import { setSeenData } from '@/hooks/query/useSeen'
import { fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { getEventId } from '@/utils/nip19'
import type { NostrEvent } from 'nostr-tools'
import { useReplyTags } from '../useEditor'

const setSeenRelays = (event: NostrEvent, relays: string[]) => {
  relays.forEach((relay) => setSeenData(event, relay))
}

const setUserRelayList = (pubkey: string, relay: string) => {
  const relayListEvent = fakeEventMeta({
    kind: Kind.RelayList,
    pubkey,
    tags: [['r', relay]],
  })

  queryClient.setQueryData(queryKeys.replaceable(Kind.RelayList, pubkey), [relayListEvent])
}

const setEventInCache = (event: ReturnType<typeof fakeEventMeta>) => {
  const queryKey = eventToQueryKey(event)
  if (queryKey) {
    queryClient.setQueryData(queryKey, [event])
  }
}

describe('useReplyTags', () => {
  describe('Kind.Text events (NIP-10)', () => {
    test('assert root and p tag.', async ({ renderHookWithQueryProvider }) => {
      const pubkey1 = 'pubkey1'
      const e1 = 'e1'

      const event = fakeEventMeta({
        kind: Kind.Text,
        id: e1,
        pubkey: pubkey1,
      })

      setSeenRelays(event, [RELAY_3, RELAY_2])
      setUserRelayList(pubkey1, RELAY_2)

      const { result } = renderHookWithQueryProvider(() => useReplyTags(event))

      expect(result.current).toStrictEqual([
        ['e', e1, RELAY_3, 'root', pubkey1],
        ['p', pubkey1, RELAY_2],
      ])
    })

    test('assert root without seen data.', async ({ renderHookWithQueryProvider }) => {
      const pubkey1 = 'pubkey1'
      const e1 = 'e1'

      const event = fakeEventMeta({
        kind: Kind.Text,
        id: e1,
        pubkey: pubkey1,
      })

      // no seen data
      setUserRelayList(pubkey1, RELAY_1)

      const { result } = renderHookWithQueryProvider(() => useReplyTags(event))

      expect(result.current).toStrictEqual([
        ['e', e1, '', 'root', pubkey1],
        ['p', pubkey1, RELAY_1],
      ])
    })

    test('assert root without author relay list.', async ({
      renderHookWithQueryProvider,
    }) => {
      const pubkey1 = 'pubkey1'
      const e1 = 'e1'

      const event = fakeEventMeta({
        kind: Kind.Text,
        id: e1,
        pubkey: pubkey1,
      })

      setSeenRelays(event, [RELAY_1])

      const { result } = renderHookWithQueryProvider(() => useReplyTags(event))

      expect(result.current).toStrictEqual([
        ['e', e1, RELAY_1, 'root', pubkey1],
        ['p', pubkey1],
      ])
    })

    test('assert root, reply and p tag.', async ({ renderHookWithQueryProvider }) => {
      const pubkey1 = 'pubkey1'
      const pubkey2 = 'pubkey2'
      const e1 = 'e1'
      const e2 = 'e2'

      const rootEvent = fakeEventMeta({
        kind: Kind.Text,
        id: e1,
        pubkey: pubkey1,
      })

      const replyEvent = fakeEventMeta({
        kind: Kind.Text,
        id: e2,
        pubkey: pubkey2,
        // NIP-10 reply: e-tag with root marker
        tags: [['e', e1, '', 'root', pubkey1]],
      })

      setSeenRelays(rootEvent, [RELAY_3])
      setSeenRelays(replyEvent, [RELAY_2])
      setUserRelayList(pubkey2, RELAY_1)
      setEventInCache(rootEvent)

      const { result } = renderHookWithQueryProvider(() => useReplyTags(replyEvent))

      expect(result.current).toStrictEqual([
        ['e', e1, RELAY_3, 'root', pubkey1],
        ['e', e2, RELAY_2, 'reply', pubkey2],
        ['p', pubkey2, RELAY_1],
      ])
    })

    test('assert root, multiple reply e tags.', async ({ renderHookWithQueryProvider }) => {
      const pubkey1 = 'pubkey1'
      const pubkey2 = 'pubkey2'
      const pubkey3 = 'pubkey3'
      const e1 = 'e1'
      const e2 = 'e2'
      const e3 = 'e3'

      const rootEvent = fakeEventMeta({
        kind: Kind.Text,
        id: e1,
        pubkey: pubkey1,
      })

      const replyEvent = fakeEventMeta({
        kind: Kind.Text,
        id: e3,
        pubkey: pubkey3,
        // existing thread e-tags (root + intermediate parent)
        tags: [
          ['e', e1, '', 'root', pubkey1],
          ['e', e2, '', 'reply', pubkey2],
        ],
      })

      setSeenRelays(rootEvent, [RELAY_3])
      setSeenRelays(replyEvent, [RELAY_2])
      setUserRelayList(pubkey3, RELAY_1)
      setEventInCache(rootEvent)

      const { result } = renderHookWithQueryProvider(() => useReplyTags(replyEvent))

      // hook only cares about rootId and current event, so it will
      // rebuild root + reply tags for e1 and e3
      expect(result.current).toStrictEqual([
        ['e', e1, RELAY_3, 'root', pubkey1],
        ['e', e3, RELAY_2, 'reply', pubkey3],
        ['p', pubkey3, RELAY_1],
      ])
    })
  })

  describe('Kind.Comments evnets (NIP-22)', () => {
    test('assert a article.', async ({ renderHookWithQueryProvider }) => {
      const pubkey1 = 'pubkey1'
      const e1 = 'e1'

      const article = fakeEventMeta({
        kind: Kind.Article,
        id: e1,
        pubkey: pubkey1,
        tags: [['d', 'article-slug']],
      })


      setSeenRelays(article, [RELAY_1])
      setUserRelayList(pubkey1, RELAY_2)

      const { result } = renderHookWithQueryProvider(() => useReplyTags(article))

      const address = getEventId(article)

      expect(result.current).toStrictEqual([
        ['A', address, RELAY_1],
        ['E', e1, RELAY_1, pubkey1],
        ['K', Kind.Article.toString()],
        ['P', pubkey1, RELAY_2],
        ['a', address, RELAY_1],
        ['e', e1, RELAY_1, pubkey1],
        ['k', Kind.Article.toString()],
        ['p', pubkey1],
      ])
    })

    test('assert a comment of a article.', async ({ renderHookWithQueryProvider }) => {
      const rootPubkey = 'pubkey1'
      const commentPubkey = 'pubkey2'
      const rootId = 'e1'
      const commentId = 'e2'

      const article = fakeEventMeta({
        kind: Kind.Article,
        id: rootId,
        pubkey: rootPubkey,
        tags: [['d', 'article-slug']],
      })

      const address = [Kind.Article.toString(), rootPubkey, 'article-slug'].join(':')

      const comment = fakeEventMeta({
        kind: Kind.Comment,
        id: commentId,
        pubkey: commentPubkey,
        // existing NIP-22 tags on the stored comment
        tags: [
          ['A', address, RELAY_3, rootPubkey],
          ['K', Kind.Article.toString()],
          ['P', rootPubkey, RELAY_3],
          ['a', address, RELAY_3, commentPubkey],
          ['e', commentId, RELAY_2, commentPubkey],
          ['k', Kind.Comment.toString()],
          ['p', commentPubkey, RELAY_2],
        ],
      })

      setEventInCache(article)
      setSeenRelays(article, [RELAY_3])
      setSeenRelays(comment, [RELAY_1])
      setUserRelayList(rootPubkey, RELAY_3)
      setUserRelayList(commentPubkey, RELAY_2)

      const { result } = renderHookWithQueryProvider(() => useReplyTags(comment))

      expect(result.current).toStrictEqual([
        ['A', address, RELAY_3],
        ['E', rootId, RELAY_3, rootPubkey],
        ['K', Kind.Article.toString()],
        ['P', rootPubkey, RELAY_3],
        ['a', address, RELAY_3],
        ['e', commentId, RELAY_1, commentPubkey],
        ['k', Kind.Comment.toString()],
        ['p', commentPubkey],
      ])
    })

    test('assert comment of a comment.', async ({ renderHookWithQueryProvider }) => {
      const rootPubkey = 'pubkey1'
      const parentPubkey = 'pubkey2'
      const replyPubkey = 'pubkey3'
      const rootId = 'e1'
      const parentId = 'e2'
      const replyId = 'e3'

      const article = fakeEventMeta({
        kind: Kind.Article,
        id: rootId,
        pubkey: rootPubkey,
        tags: [['d', 'article-slug']],
      })

      const address = [Kind.Article, rootPubkey, 'article-slug'].join(':')

      const parentComment = fakeEventMeta({
        kind: Kind.Comment,
        id: parentId,
        pubkey: parentPubkey,
        tags: [
          ['A', address, RELAY_3, rootPubkey],
          ['K', Kind.Article.toString()],
          ['P', rootPubkey, RELAY_3],
          ['a', address, RELAY_3, parentPubkey],
          ['e', parentId, RELAY_2, parentPubkey],
          ['k', Kind.Comment.toString()],
          ['p', parentPubkey, RELAY_2],
        ],
      })

      const replyComment = fakeEventMeta({
        kind: Kind.Comment,
        id: replyId,
        pubkey: replyPubkey,
        tags: [
          ['A', address, RELAY_3, rootPubkey],
          ['K', Kind.Article.toString()],
          ['P', rootPubkey, RELAY_3],
          ['e', parentId, RELAY_2, parentPubkey],
          ['k', Kind.Comment.toString()],
          ['p', parentPubkey, RELAY_2],
        ],
      })

      setEventInCache(article)
      setEventInCache(parentComment)
      setSeenRelays(article, [RELAY_3])
      setSeenRelays(parentComment, [RELAY_3])
      setSeenRelays(replyComment, [RELAY_1])
      setUserRelayList(rootPubkey, RELAY_3)
      setUserRelayList(parentPubkey, RELAY_2)
      setUserRelayList(replyPubkey, RELAY_1)

      const { result } = renderHookWithQueryProvider(() => useReplyTags(replyComment))

      expect(result.current).toStrictEqual([
        ['A', address, RELAY_3],
        ['E', rootId, RELAY_3, rootPubkey],
        ['K', Kind.Article.toString()],
        ['P', rootPubkey, RELAY_3],
        ['a', address, RELAY_3],
        ['e', replyId, RELAY_1, replyPubkey],
        ['k', Kind.Comment.toString()],
        ['p', replyPubkey],
      ])
    })
  })
})

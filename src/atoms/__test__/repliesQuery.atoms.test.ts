import { Kind } from '@/constants/kinds'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'
import { fakeEventMeta } from '@/utils/faker'
import { queryClientAtom } from 'jotai-tanstack-query'
import { describe, expect, test } from 'vitest'
import { authAtom } from '../auth.atoms'
import { addReplyAtom } from '../repliesCount.atoms'
import { repliesFamily } from '../repliesQuery.atoms'
import { store } from '../store'

describe('repliesQuery atoms', () => {
  test('sorts and filters replies while building previews', () => {
    store.set(queryClientAtom, queryClient)

    store.set(authAtom, {
      selected: 'me',
      accounts: { me: { pubkey: 'me' } },
    })

    const tags = [['e', 'root', '', 'root']]
    const root = fakeEventMeta({ id: 'root', kind: Kind.Text, pubkey: 'rooter' })
    const mine = fakeEventMeta({ id: 'mine', kind: Kind.Text, pubkey: 'me', tags: [['e', 'root', '', 'root']] })

    const followed = fakeEventMeta({ id: 'followed-1', pubkey: 'followed', tags })
    const stranger = fakeEventMeta({ id: 'stranger', pubkey: 'stranger', tags })
    const mutedAuthor = fakeEventMeta({ id: 'muted-author-note', pubkey: 'muted-author', tags })
    const mutedNote = fakeEventMeta({ id: 'muted-note', pubkey: 'someone', tags })

    const replies = [followed, stranger, mine, mutedAuthor, mutedNote]
    queryClient.setQueryData(queryKeys.tag('e', ['root'], Kind.Text), replies)
    queryClient.setQueryData(queryKeys.replaceable(Kind.Follows, 'me'), [
      fakeEventMeta({
        id: 'follows-1',
        kind: Kind.Follows,
        pubkey: 'me',
        tags: [['p', 'followed']],
      }),
    ])
    queryClient.setQueryData(queryKeys.replaceable(Kind.Mutelist, 'me'), [
      fakeEventMeta({
        id: 'mutes-1',
        kind: Kind.Mutelist,
        pubkey: 'me',
        tags: [
          ['p', 'muted-author'],
          ['e', 'muted-note'],
        ],
      }),
    ]);

    [mine, followed, stranger, mutedAuthor, mutedNote].forEach((reply) => {
      store.set(addReplyAtom, reply)
    })

    const result = store.get(repliesFamily({ event: root, pageSize: 10 }))

    expect(result.total).toBe(5)
    expect(result.muted.map((reply) => reply.id).sort()).toEqual(['muted-author-note', 'muted-note'].sort())
    expect(result.sorted.map((reply) => reply.id)).toEqual(['mine', 'followed-1', 'stranger'])
    expect(result.chunk.map((reply) => reply.id)).toEqual(['mine', 'followed-1', 'stranger'])
    expect(result.preview.map((reply) => reply.id)).toEqual(['followed-1'])
    expect(result.previewByUser('followed').map((reply) => reply.id)).toEqual(['followed-1'])
  })
})

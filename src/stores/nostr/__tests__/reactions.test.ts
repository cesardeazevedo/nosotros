import { fakeReaction } from 'utils/faker'
import { test } from 'utils/fixtures'
import { ReactionStore } from '../reactions.store'

describe('Test ReactionStore', () => {
  test('add()', () => {
    const store = new ReactionStore()
    let reaction = fakeReaction({
      pubkey: '1',
      tags: [
        ['e', '1'],
        ['p', '10'],
      ],
    })
    store.add(reaction)
    store.add(reaction) // test some duplicated
    expect(store.getByNoteId('1')).toEqual({ '🤙': ['1'] })

    reaction = fakeReaction({
      pubkey: '2',
      tags: [
        ['e', '1'],
        ['p', '10'],
      ],
    })
    store.add(reaction)
    expect(store.getByNoteId('1')).toEqual({ '🤙': ['1', '2'] })

    reaction = fakeReaction({
      pubkey: '2',
      tags: [
        ['e', '2'],
        ['p', '10'],
      ],
    })
    store.add(reaction)
    expect(store.getByNoteId('2')).toEqual({ '🤙': ['2'] })
    expect(store.reactions.toJSON()).toEqual([
      ['1', { '🤙': ['1', '2'] }],
      ['2', { '🤙': ['2'] }],
    ])

    reaction = fakeReaction({
      content: 'heart',
      pubkey: '1',
      tags: [
        ['e', '2'],
        ['p', '10'],
      ],
    })
    store.add(reaction)
    expect(store.getByNoteId('2')).toEqual({ '🤙': ['2'], heart: ['1'] })
  })

  test('getTopReaction()', () => {
    const store = new ReactionStore()
    const reactions = [
      {
        content: 'thumbs',
        pubkey: '1',
        tags: [
          ['e', '1'],
          ['p', '1'],
        ],
      },
      {
        content: 'heart',
        pubkey: '1',
        tags: [
          ['e', '1'],
          ['p', '1'],
        ],
      },
      {
        content: 'thumbs',
        pubkey: '2',
        tags: [
          ['e', '1'],
          ['p', '1'],
        ],
      },
    ]
    reactions.forEach((reaction) => store.add(fakeReaction(reaction)))
    expect(store.getTopReactions('1')).toStrictEqual([
      ['thumbs', ['1', '2']],
      ['heart', ['1']],
    ])
  })
})

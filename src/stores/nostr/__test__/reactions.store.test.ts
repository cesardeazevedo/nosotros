import { fakeReaction } from 'utils/faker'
import { test } from 'utils/fixtures'

describe('Test ReactionStore', () => {
  test('Test add', ({ root }) => {
    const store = root.reactions
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

  test('Test getTopReaction', ({ root }) => {
    const store = root.reactions
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

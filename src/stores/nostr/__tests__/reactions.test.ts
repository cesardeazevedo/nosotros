import { fakeReaction } from 'utils/faker'
import { test } from 'utils/fixtures'
import { ReactionStore } from '../reactions.store'

describe('Test ReactionStore', () => {
  test('add()', () => {
    const store = new ReactionStore()
    let reaction = fakeReaction({
      pubkey: '1',
      tags: [
        ['e', '10'],
        ['e', '11'],
        ['e', '12'],
        ['e', '1'], // the last is the actual event being reacted to
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
    expect(store.sorted('1')).toStrictEqual([
      ['thumbs', ['1', '2']],
      ['heart', ['1']],
    ])
  })

  test('assert reactionsByPubkey', () => {
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
      {
        content: 'heart',
        pubkey: '3',
        tags: [
          ['e', '1'],
          ['p', '1'],
        ],
      },
      {
        content: 'heart',
        pubkey: '3',
        tags: [
          ['e', '2'],
          ['p', '1'],
        ],
      },
      {
        content: 'cry',
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
    ]
    reactions.forEach((reaction) => store.add(fakeReaction(reaction)))
    expect(store.reactionsByPubkey.get('1')).toStrictEqual({
      1: ['thumbs', 'heart', 'cry'],
      2: ['thumbs'],
      3: ['heart'],
    })
  })
})

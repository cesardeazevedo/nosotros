import { Kind } from '@/constants/kinds'
import { parseNote } from '@/nostr/helpers/parseNote'
import { parseRelayList } from '@/nostr/types'
import { fakeEvent, fakeEventMeta } from '@/utils/faker'
import { test } from '@/utils/fixtures'
import { toJS } from 'mobx'
import { EventStore } from '../event.store'

describe('EventStore', () => {
  test('assert get and getByPubkey', () => {
    const store = new EventStore()
    const note1 = fakeEventMeta({ kind: Kind.Text, id: '1', pubkey: 'p1' })
    const note2 = fakeEventMeta({ kind: Kind.Text, id: '2', pubkey: 'p1' })
    const event1 = store.add(note1)
    const event2 = store.add(note2)
    expect(store.get('1')).toStrictEqual(event1)
    expect(store.get('2')).toStrictEqual(event2)

    expect(toJS(store.getIdsByPubkey('p1'))).toStrictEqual(new Set(['1', '2']))
    expect(toJS(store.getIdsByKind(Kind.Text))).toStrictEqual(new Set(['1', '2']))
    expect(store.getEventsByKind(Kind.Text)).toStrictEqual([event1, event2])
    expect(store.getEventsByPubkey('p1')).toStrictEqual([event1, event2])
  })

  test('assert replaceable events', () => {
    const store = new EventStore()
    store.add(
      fakeEventMeta(
        {
          kind: Kind.RelayList,
          id: '1',
          pubkey: 'p1',
          created_at: 1,
          tags: [['r', 'relay1']],
        },
        parseRelayList,
      ),
    )
    const event2 = store.add(
      fakeEventMeta(
        {
          kind: Kind.RelayList,
          id: '2',
          pubkey: 'p1',
          created_at: 2,
          tags: [['r', 'relay2']],
        },
        parseRelayList,
      ),
    )

    const kindPubkey = new Set([[Kind.RelayList, 'p1'].join(':')])

    expect(store.get([Kind.RelayList, 'p1'].join(':'))).toStrictEqual(event2)
    expect(toJS(store.getIdsByKind(Kind.RelayList))).toStrictEqual(kindPubkey)
    expect(toJS(store.getIdsByPubkey('p1'))).toStrictEqual(kindPubkey)
    expect(toJS(store.getIdsByKindPubkey(Kind.RelayList, 'p1'))).toStrictEqual(kindPubkey)
    expect(toJS(store.getIdsByKindTagValue(Kind.RelayList, 'r', 'relay2'))).toStrictEqual(kindPubkey)
    expect(toJS(store.getIdsByKindPubkeyTag(Kind.RelayList, 'p1', 'r'))).toStrictEqual(new Set(['relay2']))
    expect(toJS(store.getPubkeysByKindTagValue(Kind.RelayList, 'r', 'relay2'))).toStrictEqual(new Set(['p1']))
    // Old tags were deleted
    expect(toJS(store.getIdsByKindTagValue(Kind.RelayList, 'r', 'relay1'))).toStrictEqual(undefined)
    expect(toJS(store.getPubkeysByKindTagValue(Kind.RelayList, 'r', 'relay1'))).toStrictEqual(undefined)
  })

  test('assert addressable events', () => {
    const store = new EventStore()
    const note1 = fakeEvent({
      kind: Kind.Article,
      id: '1',
      pubkey: 'p1',
      created_at: 1,
      tags: [
        ['d', '123'],
        ['title', 'Title 1'],
        ['p', 'p2'],
      ],
    })
    const note2 = fakeEvent({
      kind: Kind.Article,
      id: '1',
      pubkey: 'p1',
      created_at: 2,
      tags: [
        ['d', '123'],
        ['title', 'Title 2'],
        ['p', 'p3'],
      ],
    })
    const event1 = store.add(note1)
    const event2 = store.add(note2)

    expect(store.get([Kind.Article, 'p1', '123'].join(':'))).toStrictEqual(event2)
    expect(toJS(store.getIdsByKind(Kind.Article))).toStrictEqual(new Set([event1.address]))
    expect(toJS(store.getIdsByPubkey('p1'))).toStrictEqual(new Set([event1.address]))
    expect(toJS(store.getIdsByKindPubkeyTag(Kind.Article, 'p1', 'p'))).toStrictEqual(new Set(['p3']))
  })

  test('assert replies', () => {
    const store = new EventStore()
    const event1 = store.add(fakeEventMeta({ id: '1', pubkey: 'p1', tags: [] }, parseNote))
    const event2 = store.add(fakeEventMeta({ id: '2', pubkey: 'p2', tags: [['e', '1', '', 'root']] }, parseNote))
    const event3 = store.add(
      fakeEventMeta(
        {
          kind: Kind.Text,
          id: '3',
          pubkey: 'p3',
          tags: [['e', '1', '', 'reply']],
        },
        parseNote,
      ),
    )
    store.add(
      fakeEventMeta(
        {
          kind: Kind.Text,
          id: '4',
          pubkey: 'p3',
          tags: [
            ['e', '1', '', 'root'],
            ['e', '2', '', 'reply'],
          ],
        },
        parseNote,
      ),
    )
    const event5 = store.add(fakeEventMeta({ id: '5', kind: 30023, pubkey: '1', tags: [['d', 'key']] }, parseNote))
    // a tag reply
    store.add(fakeEventMeta({ id: '6', tags: [['a', '30023:1:key', '', 'root']] }, parseNote))

    expect(store.getReplies(event1)).toStrictEqual(new Set(['2', '3']))
    expect(store.getReplies(event2)).toStrictEqual(new Set(['4']))
    expect(store.getReplies(event3)).toStrictEqual(new Set([]))
    expect(store.getReplies(event5)).toStrictEqual(new Set(['6']))
  })

  test('assert tags of reaction', () => {
    const store = new EventStore()
    const note1 = fakeEvent({ kind: Kind.Text, id: '1', pubkey: 'p1', tags: [] })
    const note2 = fakeEvent({ kind: Kind.Text, id: '2', pubkey: 'p2', tags: [['e', '1', '', 'root']] })
    const note3 = fakeEvent({
      kind: Kind.Reaction,
      id: '3',
      pubkey: 'p2',
      tags: [
        ['e', '1'],
        ['p', 'p1'],
      ],
    })
    const note4 = fakeEvent({
      kind: Kind.Reaction,
      id: '4',
      pubkey: 'p3',
      tags: [
        ['e', '1'],
        ['p', 'p1'],
      ],
    })
    const note5 = fakeEvent({
      kind: Kind.Reaction,
      id: '5',
      pubkey: 'p3',
      tags: [
        ['e', '1'],
        ['p', 'p1'],
      ],
    })
    // some reply
    const event1 = store.add(note1)
    const event2 = store.add(note2)
    const event3 = store.add(note3)
    const event4 = store.add(note4)
    const event5 = store.add(note5)
    expect(store.get('1')).toStrictEqual(event1)
    expect(store.get('2')).toStrictEqual(event2)
    expect(store.get('3')).toStrictEqual(event3)
    expect(store.get('4')).toStrictEqual(event4)
    expect(store.get('5')).toStrictEqual(event5)
    // note1 received 3 reactions
    expect(store.getTotalByKindTagValue(Kind.Reaction, 'e', note1.id)).toStrictEqual(3)
    // note1.pubkey author received 3 reactions
    expect(store.getTotalByKindTagValue(Kind.Reaction, 'p', note1.pubkey)).toStrictEqual(3)

    // Check if p2 liked note1
    expect(toJS(store.getIdsByKindPubkeyTagValue(Kind.Reaction, 'p2', 'e', note1.id))).toStrictEqual(new Set(['3']))
    expect(store.getEventsByKindPubkeyTagValue(Kind.Reaction, 'p2', 'e', note1.id)).toStrictEqual([event3])
    // Check if p4 liked note1
    expect(toJS(store.getIdsByKindPubkeyTagValue(Kind.Reaction, 'p3', 'e', note1.id))).toStrictEqual(
      new Set(['4', '5']),
    )
    expect(store.getEventsByKindPubkeyTagValue(Kind.Reaction, 'p3', 'e', note1.id)).toStrictEqual([event4, event5])
  })

  test('assert reposts', () => {
    const store = new EventStore()
    store.add(
      fakeEventMeta({
        kind: Kind.Text,
        id: '1',
        pubkey: 'p1',
        content: 'Pura Vida!',
      }),
    )
    const repost1 = store.add(
      fakeEventMeta({
        kind: Kind.Repost,
        id: '2',
        pubkey: 'p2',
        content: '',
        tags: [['e', '1']],
      }),
    )
    const repost2 = store.add(
      fakeEventMeta({
        kind: Kind.Repost,
        id: '3',
        pubkey: 'p3',
        content: '',
        tags: [['e', '1']],
      }),
    )
    expect(toJS(store.getIdsByKindTagValue(Kind.Repost, 'e', '1'))).toStrictEqual(new Set(['2', '3']))
    expect(store.getEventsByKindTagValue(Kind.Repost, 'e', '1')).toStrictEqual([repost1, repost2])
    expect(store.getTotalByKindTagValue(Kind.Repost, 'e', '1')).toStrictEqual(2)
  })

  test('assert lists', () => {
    const store = new EventStore()
    const event1 = store.add(
      fakeEventMeta({
        kind: Kind.Mutelist,
        id: '1',
        pubkey: 'p1',
        tags: [
          ['p', 'p2'],
          ['p', 'p3'],
          ['p', 'p4'],
        ],
      }),
    )
    store.add(
      fakeEventMeta({
        kind: Kind.Mutelist,
        id: '2',
        pubkey: 'p2',
        tags: [
          ['p', 'p3'],
          ['p', 'p4'],
          ['p', 'p5'],
        ],
      }),
    )
    //const event1 = new Event(mute1)
    expect(toJS(store.getIdsByKindPubkey(Kind.Mutelist, 'p1'))).toEqual(new Set([[Kind.Mutelist, 'p1'].join(':')]))
    expect(toJS(store.getEventsByKindPubkey(Kind.Mutelist, 'p1')[0].id)).toStrictEqual(event1.id)
    expect(toJS(store.getIdsByKindPubkeyTag(Kind.Mutelist, 'p1', 'p'))).toStrictEqual(new Set(['p2', 'p3', 'p4']))
    expect(toJS(store.getIdsByKindPubkeyTag(Kind.Mutelist, 'p2', 'p'))).toStrictEqual(new Set(['p3', 'p4', 'p5']))
  })

  test('assert relay lists', () => {
    const store = new EventStore()
    store.add(
      fakeEvent({
        kind: Kind.RelayList,
        id: '1',
        pubkey: 'p1',
        tags: [
          ['r', 'relay1'],
          ['r', 'relay2'],
          ['r', 'relay3'],
        ],
      }),
    )
    store.add(
      fakeEvent({
        kind: Kind.RelayList,
        id: '2',
        pubkey: 'p2',
        tags: [
          ['r', 'relay2'],
          ['r', 'relay3'],
          ['r', 'relay4'],
        ],
      }),
    )
    store.add(
      fakeEvent({
        kind: Kind.RelayList,
        id: '3',
        pubkey: 'p3',
        tags: [
          ['r', 'relay3'],
          ['r', 'relay4'],
          ['r', 'relay5'],
        ],
      }),
    )
    expect(toJS(store.getPubkeysByKindTagValue(Kind.RelayList, 'r', 'relay2'))).toStrictEqual(new Set(['p1', 'p2']))
    expect(toJS(store.getPubkeysByKindTagValue(Kind.RelayList, 'r', 'relay3'))).toStrictEqual(
      new Set(['p1', 'p2', 'p3']),
    )
    expect(toJS(store.getPubkeysByKindTagValue(Kind.RelayList, 'r', 'relay4'))).toStrictEqual(new Set(['p2', 'p3']))
  })
})

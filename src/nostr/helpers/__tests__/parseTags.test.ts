import { parseTags } from '../parseTags'

test('parseTags()', () => {
  const tags = [
    ['e', '1', 'wss://relay1.com'],
    ['e', '2', 'wss://relay2.com', 'mention'],
    ['e', '3', '', '', '1'], // pubkey slot
    ['e', '4', '', '', '2'], // pubkey slot
    ['q', '3', 'wss://relay3.com'],
    ['p', '3', 'wss://relay4.com'],
    ['p', '3', 'wss://relay5.com'], // duplicated
    ['p', '3', 'wss://relay5.com'], // duplicated
    ['p', '4', 'wss://relay6.com'],
    ['d', 'value'],
    ['title', '<torrent-title>'],
    ['x', 'hash'],
    ['file', 'file1', '1'],
    ['file', 'file2', '2'],
    ['i', '1'],
    ['i', '2'],
    ['t', 'tag1'],
    ['t', 'tag2'],
    ['a', '30023:pubkey:123'],
  ]
  expect(parseTags(tags)).toStrictEqual({
    a: [['a', '30023:pubkey:123']],
    e: [
      ['e', '1', 'wss://relay1.com'],
      ['e', '2', 'wss://relay2.com', 'mention'],
      ['e', '3', '', '', '1'],
      ['e', '4', '', '', '2'],
    ],
    q: [['q', '3', 'wss://relay3.com']],
    p: [
      ['p', '3', 'wss://relay4.com'],
      ['p', '3', 'wss://relay5.com'],
      ['p', '3', 'wss://relay5.com'],
      ['p', '4', 'wss://relay6.com'],
    ],
    d: [['d', 'value']],
    title: [['title', '<torrent-title>']],
    x: [['x', 'hash']],
    file: [
      ['file', 'file1', '1'],
      ['file', 'file2', '2'],
    ],
    i: [
      ['i', '1'],
      ['i', '2'],
    ],
    t: [
      ['t', 'tag1'],
      ['t', 'tag2'],
    ],
  })
})

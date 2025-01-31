import { parseContent } from '../parseContent'
import { parseTags } from '../parseTags'

test('getMentionedAuthors', () => {
  const event = {
    id: '1',
    kind: 1,
    pubkey: '1',
    content: `nostr:nevent1qqsfedxrxg77gcl3wggazrmu26d0npy4a0cjnu9fu76nu7j4gzehqhszyrrxqwc0rn87ccjansytw5ly7a6w4a73eunkjg33yk6l6nd89qqeuzu794r nostr:nprofile1qqs8n0nx0muaewav2ksx99wwsu9swq5mlndjmn3gm9vl9q2mzmup0xqq60rzu`,
    created_at: 0,
    sig: '',
    tags: [
      ['p', '2'],
      ['p', '3'],
    ],
  }
  const tags = parseTags(event.tags)
  const { mentionedAuthors } = parseContent(event, tags)
  expect(mentionedAuthors).toStrictEqual([
    '2',
    '3',
    '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
    'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e',
  ])
})

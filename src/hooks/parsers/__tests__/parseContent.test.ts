import { fakeEvent } from '@/utils/faker'
import { parseContent } from '../parseContent'

describe('parseContent', () => {
  test('assert basic text', () => {
    const { contentSchema } = parseContent(fakeEvent({ content: 'Hello nostr! https://nostr.com' }))
    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello nostr! ' },
            {
              type: 'text',
              text: 'https://nostr.com',
              marks: [{ type: 'link', attrs: { href: 'https://nostr.com/' } }],
            },
          ],
        },
      ],
    })
  })
})

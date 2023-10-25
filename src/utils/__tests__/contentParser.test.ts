import { Kind } from 'constants/kinds'
import { parseContent, parseMarkdown } from 'utils/contentParser'
import { fakeNote } from 'utils/faker'

const event = fakeNote()

describe('Test useContentParser()', () => {
  test('Test image content', () => {
    const result = parseContent({ ...event, content: 'GM https://url.com/image.jpg?' })
    expect(result).toStrictEqual([
      { kind: 'text', content: ['GM '] },
      { kind: 'image', content: 'https://url.com/image.jpg', href: 'https://url.com/image.jpg' },
      { kind: 'text', content: ['?'] },
    ])
  })

  test('Test image content with query strings', () => {
    const result = parseContent({ ...event, content: 'GM https://url.com/image.jpg?cache=1' })
    expect(result).toStrictEqual([
      { kind: 'text', content: ['GM '] },
      { kind: 'image', content: 'https://url.com/image.jpg?cache=1', href: 'https://url.com/image.jpg?cache=1' },
    ])
  })

  test('Test url with some trailing characters', () => {
    const result = parseContent({ ...event, content: 'GM https://url.com)' })
    expect(result).toStrictEqual([
      { kind: 'text', content: ['GM '] },
      { kind: 'url', content: 'https://url.com', href: 'https://url.com' },
      { kind: 'text', content: [')'] },
    ])
  })

  test('Test url content', () => {
    const result = parseContent({ ...event, content: 'Checkout https://nostr.com/ really cool!' })
    expect(result).toStrictEqual([
      { kind: 'text', content: ['Checkout '] },
      { kind: 'url', content: 'https://nostr.com/', href: 'https://nostr.com/' },
      { kind: 'text', content: [' really cool!'] },
    ])
  })

  test('Test nostr mention', () => {
    const result = parseContent({
      ...event,
      content: 'Hello nostr:nprofile1qqszclxx9f5haga8sfjjrulaxncvkfekj097t6f3pu65f86rvg49ehqj6f9dh',
    })
    expect(result).toStrictEqual([
      {
        content: [
          'Hello ',
          { kind: 'mention', content: '2c7cc62a697ea3a7826521f3fd34f0cb273693cbe5e9310f35449f43622a5cdc' },
        ],
        kind: 'text',
      },
    ])
  })

  test('Test nostr note url', () => {
    const result = parseContent({
      ...event,
      content: 'GM nostr:nevent1qqsvc6ulagpn7kwrcwdqgp797xl7usumqa6s3kgcelwq6m75x8fe8ychxp5v4',
    })
    expect(result).toStrictEqual([
      {
        content: ['GM '],
        kind: 'text',
      },
      {
        kind: 'note',
        author: undefined,
        content: 'cc6b9fea033f59c3c39a0407c5f1bfee439b077508d918cfdc0d6fd431d39393',
        relays: [],
      },
    ])
  })

  test('Test nostr url with multiple npubs', () => {
    const result = parseContent({
      ...event,
      content:
        'GM nostr:npub1870cs65g88dhcv6frwcg8t3du34d59jzntvx096ngfyvv92f2jjs8l3dpx and nostr:npub1x39j56l36gpm8apupzm0c9jkkxz2p9jx3t56hy38xpryd4u37jkqw67qu6',
    })
    expect(result).toStrictEqual([
      {
        content: [
          'GM ',
          { kind: 'mention', content: '3f9f886a8839db7c33491bb083ae2de46ada16429ad86797534248c6154954a5' },
          ' and ',
          { kind: 'mention', content: '344b2a6bf1d203b3f43c08b6fc1656b184a096468ae9ab9227304646d791f4ac' },
        ],
        kind: 'text',
      },
    ])
  })

  test('Test mention from tags', () => {
    const result = parseContent({
      ...event,
      content: 'GM #[0]',
      tags: [['p', '344b2a6bf1d203b3f43c08b6fc1656b184a096468ae9ab9227304646d791f4ac']],
    })
    expect(result).toStrictEqual([
      {
        content: [
          'GM ',
          { kind: 'mention', content: '344b2a6bf1d203b3f43c08b6fc1656b184a096468ae9ab9227304646d791f4ac' },
        ],
        kind: 'text',
      },
    ])
  })

  test('Test TLDS urls', () => {
    const content = 'building nostr.org and nostr.io'
    const result = parseContent({ ...event, content })
    expect(result).toStrictEqual([
      { kind: 'text', content: ['building '] },
      { kind: 'url', content: 'nostr.org', href: 'http://nostr.org' },
      { kind: 'text', content: [' and '] },
      {
        kind: 'url',
        content: 'nostr.io',
        href: 'http://nostr.io',
      },
    ])
  })

  test('Test URL inside parenthesis', () => {
    const content = 'Check this out (https://nostr.com)'
    const result = parseContent({ ...event, content })
    expect(result).toStrictEqual([
      {
        kind: 'text',
        content: ['Check this out (', { kind: 'url', content: 'https://nostr.com', href: 'https://nostr.com' }, ')'],
      },
    ])
  })

  test('Test URL that inside parenthesis with spaces', () => {
    const content = 'Check this out ( https://nostr.com )'
    const result = parseContent({ ...event, content })
    expect(result).toStrictEqual([
      {
        kind: 'text',
        content: ['Check this out ( ', { kind: 'url', content: 'https://nostr.com', href: 'https://nostr.com' }, ' )'],
      },
    ])
  })

  test('Test url inside parenthesis and other not', () => {
    const content = 'Check this out ( https://nostr.com ) https://nostr.com'
    const result = parseContent({ ...event, content })
    expect(result).toStrictEqual([
      {
        kind: 'text',
        content: ['Check this out ( ', { kind: 'url', content: 'https://nostr.com', href: 'https://nostr.com' }, ' ) '],
      },
      {
        kind: 'url',
        content: 'https://nostr.com',
        href: 'https://nostr.com',
      },
    ])
  })

  describe('Markdown', () => {
    test('multiple markdown syntax', () => {
      const content = `
# Title

## subtitle2

body

----

body2 nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c

body3 https://url.com/image.jpg

* list 1

* list 2 nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c

text \`escaped\` text
\`escaped2\`

> quote text

\`\`\`js
document.write('Hello World');
\`\`\`

text **strong** and _italic_ text

a &#39;quote&#39;

      `
      const event = fakeNote({ kind: Kind.Article, content })
      const result = parseMarkdown(event)
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "content": "Title",
            "kind": "title",
          },
          {
            "content": "subtitle2",
            "kind": "title",
          },
          {
            "content": [
              {
                "content": [
                  "body",
                ],
                "kind": "text",
              },
            ],
            "kind": "paragraph",
          },
          {
            "content": "",
            "kind": "divider",
          },
          {
            "content": [
              {
                "content": [
                  "body2 ",
                  {
                    "content": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                    "kind": "mention",
                  },
                ],
                "kind": "text",
              },
            ],
            "kind": "paragraph",
          },
          {
            "content": [
              {
                "content": [
                  "body3 ",
                  {
                    "content": "https://url.com/image.jpg",
                    "href": "https://url.com/image.jpg",
                    "kind": "url",
                  },
                ],
                "kind": "text",
              },
            ],
            "kind": "paragraph",
          },
          {
            "content": [
              {
                "content": [
                  "list 1",
                ],
                "kind": "text",
              },
              {
                "content": [
                  "list 2 ",
                  {
                    "content": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                    "kind": "mention",
                  },
                ],
                "kind": "text",
              },
            ],
            "kind": "list",
          },
          {
            "content": [
              {
                "content": [
                  "text ",
                  {
                    "content": "escaped",
                    "kind": "codespan",
                  },
                  " text
        ",
                  {
                    "content": "escaped2",
                    "kind": "codespan",
                  },
                ],
                "kind": "text",
              },
            ],
            "kind": "paragraph",
          },
          {
            "content": [
              {
                "content": [
                  {
                    "content": [
                      "quote text",
                    ],
                    "kind": "text",
                  },
                ],
                "kind": "paragraph",
              },
            ],
            "kind": "blockquote",
          },
          {
            "content": "document.write('Hello World');",
            "kind": "code",
          },
          {
            "content": [
              {
                "content": [
                  "text ",
                  {
                    "content": "strong",
                    "kind": "strong",
                  },
                  " and ",
                  {
                    "content": "italic",
                    "kind": "em",
                  },
                  " text",
                ],
                "kind": "text",
              },
            ],
            "kind": "paragraph",
          },
          {
            "content": [
              {
                "content": [
                  "a &#39;quote&#39;",
                ],
                "kind": "text",
              },
            ],
            "kind": "paragraph",
          },
        ]
      `)
    })
  })
})

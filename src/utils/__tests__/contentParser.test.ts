import { Kind } from 'constants/kinds'
import { nip19 } from 'nostr-tools'
import { User } from 'stores/modules/user.store'
import { fakeNote, fakeSignature, fakeUser } from 'utils/faker'
import { RELAY_1, RELAY_2, RELAY_3, test } from 'utils/fixtures'

const event = fakeNote()

describe('ContentParser', () => {
  test('Should parse text and url images', ({ createNote }) => {
    const note = createNote({ ...event, content: 'GM https://url.com/image.jpg?' })
    expect(note.content.parsed).toStrictEqual([
      { kind: 'text', content: ['GM '] },
      { kind: 'image', content: 'https://url.com/image.jpg', href: 'https://url.com/image.jpg' },
      { kind: 'text', content: ['?'] },
    ])
  })

  test('Should parse image url with query strings', ({ createNote }) => {
    const note = createNote({ ...event, content: 'GM https://url.com/image.jpg?cache=1' })
    expect(note.content.parsed).toStrictEqual([
      { kind: 'text', content: ['GM '] },
      { kind: 'image', content: 'https://url.com/image.jpg?cache=1', href: 'https://url.com/image.jpg?cache=1' },
    ])
  })

  test('Should parse a image url without extension based on imeta', ({ createNote }) => {
    const content = 'http://host.com/image http://host.com/video'
    const note = createNote({
      content,
      tags: [
        ['imeta', 'url http://host.com/image', 'm image/jpg'],
        ['imeta', 'url http://host.com/video', 'm video/mp4'],
      ],
    })
    expect(note.content.parsed).toStrictEqual([
      {
        href: 'http://host.com/image',
        content: 'http://host.com/image',
        kind: 'image',
      },
      {
        content: [' '],
        kind: 'text',
      },
      {
        kind: 'video',
        href: 'http://host.com/video',
        content: 'http://host.com/video',
      },
    ])
  })

  test('Should parse url with some extra special characters and dont append at the end', ({ createNote }) => {
    const note = createNote({ ...event, content: 'GM https://url.com)' })
    expect(note.content.parsed).toStrictEqual([
      {
        kind: 'text',
        content: [
          'GM ',
          {
            kind: 'url',
            content: 'https://url.com',
            href: 'https://url.com',
          },
          ')',
        ],
      },
    ])
  })

  test('Should parsea url with ending slash', ({ createNote }) => {
    const note = createNote({ ...event, content: 'Checkout https://nostr.com/ really cool!' })
    expect(note.content.parsed).toStrictEqual([
      {
        kind: 'text',
        content: [
          'Checkout ',
          { kind: 'url', content: 'https://nostr.com/', href: 'https://nostr.com/' },
          ' really cool!',
        ],
      },
    ])
  })

  test('Should parse a nostr:nprofile', ({ createNote }) => {
    const note = createNote({
      ...event,
      content: 'Hello nostr:nprofile1qqszclxx9f5haga8sfjjrulaxncvkfekj097t6f3pu65f86rvg49ehqj6f9dh',
    })
    expect(note.content.parsed).toStrictEqual([
      {
        content: [
          'Hello ',
          { kind: 'mention', content: '2c7cc62a697ea3a7826521f3fd34f0cb273693cbe5e9310f35449f43622a5cdc', relays: [] },
        ],
        kind: 'text',
      },
    ])
  })

  test('Should parse a nostr:nevent', ({ createNote }) => {
    const encoded = nip19.neventEncode({
      id: 'cc6b9fea033f59c3c39a0407c5f1bfee439b077508d918cfdc0d6fd431d39393',
      relays: [RELAY_2],
    })
    const note = createNote({ ...event, content: `GM nostr:${encoded}` })
    expect(note.content.parsed).toStrictEqual([
      {
        content: ['GM '],
        kind: 'text',
      },
      {
        kind: 'note',
        author: undefined,
        content: 'cc6b9fea033f59c3c39a0407c5f1bfee439b077508d918cfdc0d6fd431d39393',
        relays: [RELAY_2],
      },
    ])
  })

  test('Should parse multiple nostr:npub', ({ createNote }) => {
    const note = createNote({
      ...event,
      content:
        'GM nostr:npub1870cs65g88dhcv6frwcg8t3du34d59jzntvx096ngfyvv92f2jjs8l3dpx and nostr:npub1x39j56l36gpm8apupzm0c9jkkxz2p9jx3t56hy38xpryd4u37jkqw67qu6',
    })
    expect(note.content.parsed).toStrictEqual([
      {
        content: [
          'GM ',
          { kind: 'mention', content: '3f9f886a8839db7c33491bb083ae2de46ada16429ad86797534248c6154954a5', relays: [] },
          ' and ',
          { kind: 'mention', content: '344b2a6bf1d203b3f43c08b6fc1656b184a096468ae9ab9227304646d791f4ac', relays: [] },
        ],
        kind: 'text',
      },
    ])
  })

  test('Should parse #[0] mention + tags', ({ createNote }) => {
    const note = createNote({
      ...event,
      content: 'GM #[0]',
      tags: [['p', '344b2a6bf1d203b3f43c08b6fc1656b184a096468ae9ab9227304646d791f4ac']],
    })
    expect(note.content.parsed).toStrictEqual([
      {
        kind: 'text',
        content: [
          'GM ',
          { kind: 'mention', content: '344b2a6bf1d203b3f43c08b6fc1656b184a096468ae9ab9227304646d791f4ac', relays: [] },
        ],
      },
    ])
  })

  test('Should parse TLDS urls', ({ createNote }) => {
    const content = 'building nostr.org and nostr.io'
    const note = createNote({ ...event, content })
    expect(note.content.parsed).toStrictEqual([
      {
        kind: 'text',
        content: [
          'building ',
          { kind: 'url', content: 'nostr.org', href: 'http://nostr.org' },
          ' and ',
          {
            kind: 'url',
            content: 'nostr.io',
            href: 'http://nostr.io',
          },
        ],
      },
    ])
  })

  test('Should parse a url inside parenthesis and other url without parenthesis', ({ createNote }) => {
    const content = 'Check this out ( https://nostr.com ) https://nostr.com'
    const note = createNote({ ...event, content })
    expect(note.content.parsed).toStrictEqual([
      {
        kind: 'text',
        content: [
          'Check this out ( ',
          { kind: 'url', content: 'https://nostr.com', href: 'https://nostr.com' },
          ' ) ',
          {
            kind: 'url',
            content: 'https://nostr.com',
            href: 'https://nostr.com',
          },
        ],
      },
    ])
  })

  test('Should parse user about content', ({ root }) => {
    const event = fakeUser('1', { about: 'Building https://nosotros.app' })
    const user = User.fromNostrEvent(root, event)
    expect(user.metadata.aboutParsed).toStrictEqual([
      {
        kind: 'text',
        content: ['Building ', { kind: 'url', href: 'https://nosotros.app', content: 'https://nosotros.app' }],
      },
    ])
  })

  test('Should parse multiple nostr:nevent and nostr:nprofile and match mentionedAuthors and mentionedNotes', ({
    createNote,
  }) => {
    const user1 = fakeSignature(fakeUser())
    const user2 = fakeSignature(fakeUser(undefined, { name: 'user2' }))
    const event1 = fakeSignature(fakeNote())
    const nevent1 = nip19.neventEncode({ id: event1.id, relays: [RELAY_1] })
    const nevent2 = nip19.neventEncode({ id: event1.id, relays: [RELAY_2] })
    const nevent3 = nip19.neventEncode({ id: event1.id, relays: [], author: user1.id })

    const nprofile1 = nip19.nprofileEncode({ pubkey: user1.id, relays: [RELAY_2] })
    const nprofile2 = nip19.nprofileEncode({ pubkey: user2.id, relays: [RELAY_3] })
    const note = createNote({
      content: `nostr:${nevent1} nostr:${nevent2} nostr:${nevent3} nostr:${nprofile1} nostr:${nprofile2}`,
      tags: [['p', '1', RELAY_2]],
    })
    expect(note.content.parsed).toStrictEqual([
      {
        kind: 'note',
        author: undefined,
        content: event1.id,
        relays: [RELAY_1],
      },
      {
        kind: 'text',
        content: [' '],
      },
      {
        kind: 'note',
        author: undefined,
        content: event1.id,
        relays: [RELAY_2],
      },
      {
        kind: 'text',
        content: [' '],
      },
      {
        kind: 'note',
        content: event1.id,
        author: user1.id,
        relays: [],
      },
      {
        kind: 'text',
        content: [
          ' ',
          {
            kind: 'mention',
            content: user1.id,
            relays: [RELAY_2],
          },
          ' ',
          {
            kind: 'mention',
            content: user2.id,
            relays: [RELAY_3],
          },
        ],
      },
    ])
    expect(note.content.mentionedAuthors).toStrictEqual([user1.id, user2.id])
    expect(note.content.mentionedNotes).toStrictEqual([event1.id])
  })

  describe('Markdown', () => {
    test('multiple markdown syntax', ({ createNote }) => {
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
      const note = createNote(event)
      expect(note.content.parsed).toMatchInlineSnapshot(`
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
                    "relays": [],
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
                ],
                "kind": "text",
              },
              {
                "content": "https://url.com/image.jpg",
                "href": "https://url.com/image.jpg",
                "kind": "image",
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
                    "relays": [],
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

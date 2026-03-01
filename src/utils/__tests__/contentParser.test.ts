import { cleanParagraph, parse } from '../contentParser'
import { fakeEvent } from '../faker'

describe('welshmanToProseMirror', () => {
  test('assert codespan', () => {
    const event = fakeEvent({ content: 'test:`Code snippet`' })
    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })

    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'test:' },
            {
              type: 'text',
              text: 'Code snippet',
              marks: [{ type: 'code' }],
            },
          ],
        },
      ],
    })
  })

  test('assert codeblock', () => {
    const event = fakeEvent({ content: 'Hi:```Code snippet```' })
    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })

    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hi:' }],
        },
        {
          type: 'codeBlock',
          attrs: { language: '' },
          content: [{ type: 'text', text: 'Code snippet' }],
        },
      ],
    })
  })

  test('assert trimParagraph', () => {
    expect(cleanParagraph({ type: 'paragraph' })).toBeNull()
    expect(cleanParagraph({ type: 'paragraph', content: [] })).toBeNull()
    expect(
      cleanParagraph({
        type: 'paragraph',
        content: [{ type: 'text', text: ' ' }, { type: 'hardBreak' }, { type: 'text', text: ' ' }],
      }),
    ).toBeNull()

    expect(
      cleanParagraph({
        type: 'paragraph',
        content: [
          { type: 'hardBreak' },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'Hello' },
          { type: 'hardBreak' },
          { type: 'text', text: 'world' },
          { type: 'text', text: '' },
          { type: 'hardBreak' },
        ],
      }),
    ).toStrictEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello' }, { type: 'hardBreak' }, { type: 'text', text: 'world' }],
    })
  })

  test('assert media indexes', () => {
    const event = fakeEvent({
      content:
        'GM!: https://host.com/image.jpg https://host.com/video.mp4 https://host.com/image2.png text https://host.com/image3.jpg',
    })
    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })
    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'GM!: ' }] },
        {
          type: 'mediaGroup',
          content: [
            {
              type: 'image',
              attrs: { src: 'https://host.com/image.jpg' },
              index: 0,
            },
            {
              type: 'video',
              attrs: { src: 'https://host.com/video.mp4' },
              index: 1,
            },
            {
              type: 'image',
              attrs: { src: 'https://host.com/image2.png' },
              index: 2,
            },
          ],
        },
        {
          content: [
            {
              text: ' text ',
              type: 'text',
            },
          ],
          type: 'paragraph',
        },
        {
          attrs: {
            src: 'https://host.com/image3.jpg',
          },
          type: 'image',
          index: 3,
        },
      ],
    })
  })

  test('assert spotify embed', () => {
    const event = fakeEvent({
      content: 'https://open.spotify.com/embed/track/123',
    })
    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })
    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'spotify',
          attrs: { src: 'https://open.spotify.com/embed/track/123' },
        },
      ],
    })
  })


  test('assert markdown content', ({ }) => {
    const event = fakeEvent({
      kind: 30023,
      content: `
      # Title

      * list 1
      * list 2
      * list 3

      text **bold** *italic* [link](https://nostr.com)
        `,
    })
    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })
    expect(contentSchema).toStrictEqual(
      {
        "content": [
          {
            "attrs": {
              "level": 1,
            },
            "content": [
              {
                "text": "Title",
                "type": "text",
              },
            ],
            "type": "heading",
          },
          {
            "attrs": {
              "tight": true,
            },
            "content": [
              {
                "content": [
                  {
                    "content": [
                      {
                        "text": "list 1",
                        "type": "text",
                      },
                    ],
                    "type": "paragraph",
                  },
                ],
                "type": "listItem",
              },
              {
                "content": [
                  {
                    "content": [
                      {
                        "text": "list 2",
                        "type": "text",
                      },
                    ],
                    "type": "paragraph",
                  },
                ],
                "type": "listItem",
              },
              {
                "content": [
                  {
                    "content": [
                      {
                        "text": "list 3",
                        "type": "text",
                      },
                    ],
                    "type": "paragraph",
                  },
                ],
                "type": "listItem",
              },
            ],
            "type": "bulletList",
          },
          {
            "content": [
              {
                "text": "text ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "type": "bold",
                  },
                ],
                "text": "bold",
                "type": "text",
              },
              {
                "text": " ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "type": "italic",
                  },
                ],
                "text": "italic",
                "type": "text",
              },
              {
                "text": " ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "class": null,
                      "href": "https://nostr.com",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
                    },
                    "type": "link",
                  },
                ],
                "text": "link",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "doc",
      }
    )
  })

  test('assert nostr links inside markdown', ({ }) => {
    const event = fakeEvent({
      kind: 30023,
      content: `### Test nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj`,
    })
    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })
    expect(contentSchema).toMatchInlineSnapshot(
      {
        "content": [
          {
            "attrs": {
              "level": 3,
            },
            "content": [
              {
                "text": "Test ",
                "type": "text",
              },
              {
                "attrs": {
                  "bech32": "nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj",
                  "pubkey": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                  "relays": [
                    "wss://relay.damus.io",
                  ],
                  "type": "nprofile",
                },
                "type": "nprofile",
              },
            ],
            "type": "heading",
          },
        ],
        "type": "doc",
      }, `
      {
        "content": [
          {
            "attrs": {
              "level": 3,
            },
            "content": [
              {
                "text": "Test ",
                "type": "text",
              },
              {
                "attrs": {
                  "bech32": "nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj",
                  "pubkey": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                  "relays": [
                    "wss://relay.damus.io",
                  ],
                  "type": "nprofile",
                },
                "type": "nprofile",
              },
            ],
            "type": "heading",
          },
        ],
        "type": "doc",
      }
    `)
  })

  test('assert markdown nested lists', () => {
    const event = fakeEvent({
      kind: 30023,
      content: `
* parent 1
  * child 1
  * child 2
* parent 2
      `,
    })

    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })

    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          attrs: { tight: true },
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'parent 1' }],
                },
                {
                  type: 'bulletList',
                  attrs: { tight: true },
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'child 1' }],
                        },
                      ],
                    },
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: 'child 2' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'parent 2' }],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  test('assert plain text paragraphs keep double hard break', () => {
    const event = fakeEvent({
      content:
        "It takes a lot of time to learn how to properly prompt to get the results that you want. You have to wear new hats and do things that you're probably not used to doing. I can only say that practice makes perfect or at least helps.\n\nI don't have a video. It was a private session. Perhaps I'll record one and post it.",
    })

    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })

    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "It takes a lot of time to learn how to properly prompt to get the results that you want. You have to wear new hats and do things that you're probably not used to doing. I can only say that practice makes perfect or at least helps.",
            },
            { type: 'hardBreak' },
            { type: 'hardBreak' },
            {
              type: 'text',
              text: "I don't have a video. It was a private session. Perhaps I'll record one and post it.",
            },
          ],
        },
      ],
    })
  })

  test('assert markdown horizontal rule', () => {
    const event = fakeEvent({
      kind: 30023,
      content: `
Before

***

After
      `,
    })

    const { contentSchema } = parse({ content: event.content, tags: event.tags, markdown: true })

    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Before' }],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'After' }],
        },
      ],
    })
  })

  test('assert invalid tld is not parsed as link', () => {
    const event = fakeEvent({
      kind: 30023,
      content: 'persistent Node.js Gateway',
    })

    const { contentSchema } = parse({ content: event.content, tags: event.tags })

    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'persistent Node.js Gateway' }],
        },
      ],
    })
  })

  test('assert plain note keeps dash line and parses links', () => {
    const event = fakeEvent({
      content:
        'Now with running #omarchy I’m still learning how stuff can work with Arch Linux. \n\n- pacman for https://wiki.archlinux.org/title/Official_repositories and https://aur.archlinux.org/packages',
    })

    const { contentSchema } = parse({ content: event.content, tags: event.tags })

    expect(contentSchema).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Now with running ',
            },
            {
              type: 'text',
              text: '#omarchy',
              marks: [
                {
                  type: 'tag',
                  attrs: {
                    tag: '#omarchy',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: ' I’m still learning how stuff can work with Arch Linux. ',
            },
            {
              type: 'hardBreak',
            },
            {
              type: 'hardBreak',
            },
            {
              type: 'text',
              text: '- pacman for ',
            },
            {
              type: 'text',
              text: 'https://wiki.archlinux.org/title/Official_repositories',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://wiki.archlinux.org/title/Official_repositories',
                  },
                },
              ],
            },
            {
              type: 'text',
              text: ' and ',
            },
            {
              type: 'text',
              text: 'https://aur.archlinux.org/packages',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://aur.archlinux.org/packages',
                  },
                },
              ],
            },
          ],
        },
      ],
    })
  })
})

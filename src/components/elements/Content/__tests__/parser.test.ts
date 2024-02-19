import { Kind } from 'constants/kinds'
import { nip19 } from 'nostr-tools'
import { fakeNote, fakeSignature } from 'utils/faker'
import { test } from 'utils/fixtures'
import { parseNote } from '../parser'

describe('ContentParser', () => {
  test('Should assert the content with a image url with imeta', ({ createNote }) => {
    const note = createNote({
      content: 'http://host.com/image http://host.com/video https://simplelink.com',
      tags: [
        ['imeta', 'url http://host.com/image', 'm image/jpg'],
        ['imeta', 'url http://host.com/video', 'm video/mp4'],
      ],
    })
    expect(parseNote(note.event, note.references, note.imeta)).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "type": "paragraph",
          },
          {
            "attrs": {
              "alt": null,
              "src": "http://host.com/image",
              "title": null,
            },
            "type": "image",
          },
          {
            "content": [
              {
                "text": " ",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
          {
            "attrs": {
              "src": "http://host.com/video",
            },
            "type": "video",
          },
          {
            "content": [
              {
                "text": " ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "href": "https://simplelink.com",
                    },
                    "type": "link",
                  },
                ],
                "text": "https://simplelink.com",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "doc",
      }
    `)
  })

  test('Should assert the content with multiple nodes', ({ createNote }) => {
    const ref = fakeSignature(
      fakeNote({
        id: '1a8232732307c9190d8d87f9692527ed34c388687247490f9fa4d0ba38db539c',
        content: 'related',
        created_at: 1,
        pubkey: '1',
      }),
    )
    const nevent = nip19.neventEncode({ id: ref.id, relays: [], author: ref.pubkey })
    const note = createNote({
      content: `Hi! https://google.com #tag nostr:${nevent} Hi nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj check this out https://nostr.com/img.jpg https://v.nostr.build/g6BQ.mp4`,
    })
    expect(parseNote(note.event)).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "content": [
              {
                "text": "Hi! ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "href": "https://google.com",
                    },
                    "type": "link",
                  },
                ],
                "text": "https://google.com",
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
                      "tag": "#tag",
                    },
                    "type": "tag",
                  },
                ],
                "text": "#tag",
                "type": "text",
              },
              {
                "text": " ",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
          {
            "attrs": {
              "author": "e384fed7cd372bfa9422ad5d0714580fbfbe524a32db4836452857aa1322f88b",
              "id": "2968872fe8fae19ebbcc2dbedf90099381519d0801c9d4c3b7139c7bd75a90ea",
              "relays": [],
            },
            "type": "note",
          },
          {
            "content": [
              {
                "text": " Hi ",
                "type": "text",
              },
              {
                "attrs": {
                  "pubkey": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                  "relays": [
                    "wss://relay.damus.io",
                  ],
                  "text": "nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj",
                },
                "type": "mention",
              },
              {
                "text": " check this out ",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
          {
            "attrs": {
              "alt": null,
              "src": "https://nostr.com/img.jpg",
              "title": null,
            },
            "type": "image",
          },
          {
            "content": [
              {
                "text": " ",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
          {
            "attrs": {
              "src": "https://v.nostr.build/g6BQ.mp4",
            },
            "type": "video",
          },
        ],
        "type": "doc",
      }
    `)
  })

  test('Should assert markdown content', ({ createNote }) => {
    const note = createNote({
      kind: Kind.Article,
      content: `
# Title

* list 1
* list 2
* list 3

text **bold** *italic* [link](https://google.com)
`,
    })
    expect(parseNote(note.event)).toMatchInlineSnapshot(`
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
                "text": " link",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "doc",
      }
    `)
  })
})

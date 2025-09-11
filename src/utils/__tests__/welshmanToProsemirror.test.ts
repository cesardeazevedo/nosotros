import { parse } from '@welshman/content'
import { fakeEvent } from '../faker'
import { cleanParagraph, groupProsemirrorMedia, welshmanToProseMirror } from '../welshmanToProsemirror'

describe('welshmanToProseMirror', () => {
  test('assert codespan', () => {
    const event = fakeEvent({ content: 'test:`Code snippet`' })
    const parsed = parse({ content: event.content, tags: event.tags })
    const { contentSchema } = welshmanToProseMirror(parsed)

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
    const parsed = parse({ content: event.content, tags: event.tags })
    const { contentSchema } = welshmanToProseMirror(parsed)

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
    const parsed = parse({ content: event.content, tags: event.tags })
    const { contentSchema } = welshmanToProseMirror(parsed)
    expect(groupProsemirrorMedia(contentSchema)).toStrictEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'GM!: ' }] },
        {
          type: 'mediaGroup',
          content: [
            {
              type: 'image',
              attrs: { src: 'https://host.com/image.jpg', index: 0 },
            },
            {
              type: 'video',
              attrs: { src: 'https://host.com/video.mp4', index: 1 },
            },
            {
              type: 'image',
              attrs: { src: 'https://host.com/image2.png', index: 2 },
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
            index: 3,
            src: 'https://host.com/image3.jpg',
          },
          type: 'image',
        },
      ],
    })
  })
})

import { parse } from '@welshman/content'
import { fakeEvent } from '../faker'
import { welshmanToProseMirror } from '../welshmanToProsemirror'

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
})

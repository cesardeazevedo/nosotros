import type { BulletListNode, OrderedListNode } from 'nostr-editor'
import React from 'react'
import { html } from 'react-strict-dom'
import { Paragraph } from '../Layout/Paragraph'
import { CodeBlock } from './CodeBlock'

type Props = {
  type: 'ol' | 'ul'
  node: OrderedListNode | BulletListNode
}

const Elements = {
  ol: html.ol,
  ul: html.ul,
}

export const List = (props: Props) => {
  const { type, node } = props
  const Component = Elements[type]
  return (
    <Component>
      {node.content.map((item, index) => (
        <html.li key={item.type + index}>
          {item.content.map((node, index) => (
            <React.Fragment key={node.type + index}>
              {node.type === 'paragraph' && <Paragraph node={node} />}
              {node.type === 'codeBlock' && <CodeBlock node={node} />}
            </React.Fragment>
          ))}
        </html.li>
      ))}
    </Component>
  )
}

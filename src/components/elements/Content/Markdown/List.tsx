import { spacing } from '@/themes/spacing.stylex'
import type { BulletListNode, OrderedListNode } from 'nostr-editor'
import React from 'react'
import { css, html } from 'react-strict-dom'
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
    <Component style={[styles.root, type === 'ol' ? styles.ordered : styles.unordered]}>
      {node.content.map((item, index) => (
        <html.li key={item.type + index}>
          {item.content.map((childNode, index) => (
            <React.Fragment key={childNode.type + index}>
              {childNode.type === 'paragraph' && <Paragraph node={childNode} />}
              {childNode.type === 'codeBlock' && <CodeBlock node={childNode} />}
              {childNode.type === 'bulletList' && <List type='ul' node={childNode} />}
              {childNode.type === 'orderedList' && <List type='ol' node={childNode} />}
            </React.Fragment>
          ))}
        </html.li>
      ))}
    </Component>
  )
}

const styles = css.create({
  root: {
    marginBlock: spacing['margin0.5'],
    paddingInlineStart: spacing.padding4,
    listStylePosition: 'outside',
  },
  unordered: {
    listStyleType: 'disc',
  },
  ordered: {
    listStyleType: 'decimal',
  },
})

import React from 'react'
import Link from './Link/Link'
import { CodeSpan } from './Markdown/CodeSpan'
import { Mention } from './Mention/Mention'
import Tag from './Tag/Tag'
import type { BlockQuoteNode, HeadingNode, Mark, ParagraphNode, TextNode } from '../../../content/types'

type Props = {
  node: TextNode
}

function Text(props: Props) {
  const { text, marks = [] } = props.node
  return (
    <>
      {marks.reduce(
        (content, mark: Mark) => {
          switch (mark.type) {
            case 'bold':
              return <b>{content}</b>
            case 'italic':
              return <i>{content}</i>
            case 'strike':
              return <s>{content}</s>
            case 'code':
              return <CodeSpan>{content}</CodeSpan>
            case 'tag':
              return <Tag>{content}</Tag>
            case 'link':
              return <Link href={mark.attrs.href}>{content}</Link>
            default:
              return content
          }
        },
        <span>{text}</span>,
      )}
    </>
  )
}

export function TextContent(props: { node: ParagraphNode | HeadingNode | BlockQuoteNode }) {
  return (
    <>
      {props.node.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'mention' && <Mention pubkey={node.attrs.pubkey} />}
          {node.type === 'text' && <Text node={node} />}
          {node.type === 'hardBreak' && <br />}
        </React.Fragment>
      ))}
    </>
  )
}

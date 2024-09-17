import type { BlockQuoteNode, HeadingNode, Mark, ParagraphNode, TextNode } from 'nostr-editor'
import React, { useContext } from 'react'
import { ContentContext } from './Content'
import Link from './Link/Link'
import { CodeSpan } from './Markdown/CodeSpan'
import { NProfile } from './NProfile/NProfile'
import Tag from './Tag/Tag'
import { Text } from '@/components/ui/Text/Text'

type Props = {
  node: TextNode
}

function TextMark(props: Props) {
  const { text, marks = [] } = props.node
  const { disableLink } = useContext(ContentContext)
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
              return disableLink ? content : <Link href={mark.attrs.href}>{content}</Link>
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
    <Text size='lg'>
      {props.node.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {/* @ts-expect-error old schema */}
          {(node.type === 'nprofile' || node.type === 'mention') && <NProfile pubkey={node.attrs.pubkey} />}
          {node.type === 'text' && <TextMark node={node} />}
          {node.type === 'hardBreak' && (
            <>
              <br />
              <div style={{ marginTop: 8 }} />
            </>
          )}
        </React.Fragment>
      ))}
    </Text>
  )
}

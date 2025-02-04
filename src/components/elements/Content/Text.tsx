import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import type { BlockQuoteNode, HeadingNode, Mark, ParagraphNode, TextNode } from 'nostr-editor'
import React from 'react'
import { ContentLink } from './Link/Link'
import { CodeSpan } from './Markdown/CodeSpan'
import { NEventInline } from './NEvent/NEventInline'
import { NProfile } from './NProfile/NProfile'
import { Tag } from './Tag/Tag'

type TextMarkProps = {
  node: TextNode
}

function TextMark(props: TextMarkProps) {
  const { text, marks = [] } = props.node
  const { disableLink } = useContentContext()
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
              return disableLink ? content : <ContentLink href={mark.attrs.href}>{content}</ContentLink>
            default:
              return content
          }
        },
        <>{text}</>,
      )}
    </>
  )
}

export type Props = {
  node: ParagraphNode | HeadingNode | BlockQuoteNode
  hardBreak?: boolean
} & Omit<TextProps, 'children'>

export const TextContent = (props: Props) => {
  const { node, hardBreak = true, ...rest } = props
  const length = node.content?.length || 0
  return (
    <Text size='lg' {...rest}>
      {node.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'nprofile' && <NProfile pubkey={node.attrs.pubkey} />}
          {node.type === 'text' && <TextMark node={node} />}
          {node.type === 'nevent' && <NEventInline attrs={node.attrs} />}
          {/*Don't render headBreaks at the beginning or end of the content*/}
          {node.type === 'hardBreak' && index !== 0 && index !== length - 1 && <>{hardBreak ? <br /> : ' '}</>}
        </React.Fragment>
      ))}
    </Text>
  )
}

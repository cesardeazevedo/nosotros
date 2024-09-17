import { spacing } from '@/themes/spacing.stylex'
import type { ReactNode } from '@tanstack/react-router'
import type { ParagraphNode } from 'nostr-editor'
import React, { useContext, useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentContext } from '../Content'
import { TextContent } from '../Text'
import { BubbleContainer } from './Bubble'

type Props = {
  node: ParagraphNode
  bubble?: boolean
  children?: ReactNode
}

export function Paragraph(props: Props) {
  const { node, bubble = false } = props
  const { dense } = useContext(ContentContext)

  // We don't wanna render a empty paragraph with a hardBreak, we might have to fix it inside nostr-editor directly
  const isInvalid = useMemo(() => {
    return (node.content?.length === 1 && node.content[0].type === 'hardBreak') || !node.content
  }, [node.content])

  const BubbleWrapper = bubble ? BubbleContainer : React.Fragment

  return (
    <>
      {!isInvalid && (
        <BubbleWrapper>
          {props.children}
          <html.div style={[styles.container, dense && styles.container$dense]}>
            <TextContent node={node} />
          </html.div>
        </BubbleWrapper>
      )}
      {isInvalid && props.children}
    </>
  )
}

const styles = css.create({
  container: {
    paddingInline: spacing.padding2,
    paddingBlock: 0,
    lineHeight: 1.7,
    wordBreak: 'break-word',
    height: 'auto',
  },
  container$dense: {
    padding: 0,
    lineHeight: 1.5,
  },
})

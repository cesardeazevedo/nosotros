import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { BlockQuoteNode } from 'nostr-editor'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { Paragraph } from '../Layout/Paragraph'

type Props = {
  node: BlockQuoteNode
}

export const BlockQuote = (props: Props) => {
  return (
    <html.div style={styles.root}>
      {props.node.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'paragraph' && <Paragraph node={node} />}
        </React.Fragment>
      ))}
    </html.div>
  )
}

const styles = css.create({
  root: {
    marginLeft: spacing.margin2,
    marginBlock: spacing.margin4,
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
    borderLeft: '6px solid',
    borderColor: palette.outlineVariant,
    fontStyle: 'italic',
    opacity: 0.5,
  },
})

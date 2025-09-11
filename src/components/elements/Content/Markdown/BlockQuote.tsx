import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
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
    marginBlock: spacing.margin2,
    paddingBlock: spacing.padding1,
    paddingLeft: spacing.padding1,
    paddingRight: spacing.padding4,
    borderLeft: '5px solid',
    borderLeftColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLow,
    lineHeight: typeScale.labelLineHeight$sm,
    fontStyle: 'italic',
    color: palette.onSurfaceVariant,
    opacity: 1,
  },
})

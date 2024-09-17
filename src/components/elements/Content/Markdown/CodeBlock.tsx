import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { CopyButton } from 'components/elements/Buttons/CopyButton'
import type { CodeBlockNode } from 'nostr-editor'
import React, { useRef } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  node: CodeBlockNode
}

export function CodeBlock(props: Props) {
  const refPre = useRef<HTMLPreElement | null>(null)

  return (
    <html.div style={[styles.root, props.sx]}>
      <html.pre style={styles.pre} ref={refPre}>
        {props.node.content.map((node, index) => (
          <React.Fragment key={node.type + index}>{node.type === 'text' && node.text}</React.Fragment>
        ))}
      </html.pre>
      <CopyButton text={refPre.current?.innerText} title='Copy code' sx={styles.copy} />
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    marginTop: spacing.margin1,
    marginInline: spacing.margin2,
    paddingRight: spacing.padding6,
    borderRadius: shape.lg,
    backgroundColor: palette.outlineVariant,
  },
  pre: {
    marginBlock: spacing.margin1,
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
    overflow: 'scroll',
  },
  copy: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
})

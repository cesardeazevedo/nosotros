import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { CopyIconButton } from '@/components/elements/Buttons/CopyIconButton'
import type { CodeBlockNode } from 'nostr-editor'
import React, { useRef } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  node: CodeBlockNode
}

export const CodeBlock = (props: Props) => {
  const refPre = useRef<HTMLPreElement | null>(null)

  return (
    <html.div style={[styles.root, props.sx]}>
      <html.pre style={styles.pre} ref={refPre}>
        {props.node.content.map((node, index) => (
          <React.Fragment key={node.type + index}>{node.type === 'text' && node.text}</React.Fragment>
        ))}
        <CopyIconButton text={refPre.current?.innerText} title='Copy code' sx={styles.copy} />
      </html.pre>
    </html.div>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
    paddingRight: spacing.padding6,
  },
  pre: {
    position: 'relative',
    padding: spacing.padding2,
    backgroundColor: palette.outlineVariant,
    borderRadius: shape.lg,
    overflow: 'scroll',
  },
  copy: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
})

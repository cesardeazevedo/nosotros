import { CopyIconButton } from '@/components/elements/Buttons/CopyIconButton'
import type { SxProps } from '@/components/ui/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { CodeBlockNode } from 'nostr-editor'
import { useRef } from 'react'
import ShikiHighlighter from 'react-shiki'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  node: CodeBlockNode
}

export const CodeBlock = (props: Props) => {
  const refPre = useRef<HTMLDivElement | null>(null)
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useGlobalSettings().theme
  const isAuto = theme === 'auto'
  const isDark = (isAuto && isSystemDark) || theme === 'dark'

  const { language } = props.node.attrs

  return (
    <html.div style={[styles.root, props.sx]}>
      <html.div style={styles.code} ref={refPre}>
        {props.node.content.map((node, index) => (
          <ShikiHighlighter
            key={node.type + index}
            language={language}
            theme={isDark ? 'github-dark-high-contrast' : 'github-light-default'}>
            {node.type === 'text' ? node.text.toString() : ''}
          </ShikiHighlighter>
        ))}
        <CopyIconButton text={refPre.current?.innerText} title='Copy code' sx={styles.copy} />
      </html.div>
    </html.div>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
    paddingRight: spacing.padding4,
  },
  code: {
    position: 'relative',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    overflow: 'hidden',
  },
  copy: {
    position: 'absolute',
    top: 4,
    right: 32,
  },
})

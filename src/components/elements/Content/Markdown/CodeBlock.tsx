import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useIsDarkTheme } from '@/hooks/useTheme'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { CodeBlockNode } from 'nostr-editor'
import { useRef } from 'react'
import ShikiHighlighter from 'react-shiki'
import { css, html } from 'react-strict-dom'
import { CopyIconButton } from '../../Buttons/CopyIconButton'

type Props = {
  sx?: SxProps
  node: CodeBlockNode
}

export const CodeBlock = (props: Props) => {
  const { dense } = useContentContext()
  const refPre = useRef<HTMLDivElement | null>(null)
  const isDark = useIsDarkTheme()

  const { node } = props
  const { language } = props.node.attrs
  const code = node.type === 'codeBlock' && node.content[0].type === 'text' ? node.content[0].text.toString() : ''

  return (
    <html.div style={[styles.root, dense && styles.root$dense, props.sx]}>
      <html.div style={styles.code} ref={refPre}>
        <Stack justify='space-between' sx={styles.header}>
          <div>{language}</div>
          <CopyIconButton text={refPre.current?.innerText} title='Copy code' />
        </Stack>
        <ShikiHighlighter
          language={language}
          showLanguage={false}
          addDefaultStyles={false}
          className={css.props(styles.pre).className}
          theme={isDark ? 'github-dark-high-contrast' : 'github-light-default'}>
          {code}
        </ShikiHighlighter>
      </html.div>
    </html.div>
  )
}

const styles = css.create({
  root: {
    maxWidth: 'max-content',
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding2,
    overflow: 'auto',
  },
  root$dense: {
    paddingInline: 0,
  },
  code: {
    position: 'relative',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    overflow: 'hidden',
  },
  pre: {
    wordBreak: 'break-all',
    whiteSpace: 'normal',
  },
  header: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding1,
    paddingBlock: spacing['padding0.5'],
    color: palette.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: '0.80rem',
    letterSpacing: '-0.05em',
    userSelect: 'none',
  },
})

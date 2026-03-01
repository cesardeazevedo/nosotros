import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useIsDarkTheme } from '@/hooks/useTheme'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { CodeBlockNode } from 'nostr-editor'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { CopyIconButton } from '../../Buttons/CopyIconButton'
import { getShikiHighlighter, normalizeCodeLanguage, type HighlighterTheme } from '@/utils/shikiHighlighter'

type Props = {
  sx?: SxProps
  node: CodeBlockNode
}

const ShikiHighlighter = memo(function ShikiHighlighter(props: { code: string; language?: string; theme: HighlighterTheme }) {
  const [content, setContent] = useState<string | null>(null)
  const normalizedLanguage = useMemo(() => normalizeCodeLanguage(props.language), [props.language])

  useEffect(() => {
    let active = true

    const run = async () => {
      const highlighter = await getShikiHighlighter()
      const html = highlighter.codeToHtml(props.code, {
        lang: normalizedLanguage,
        theme: props.theme,
      })
      if (active) {
        setContent(html)
      }
    }

    run().catch(() => {
      if (active) setContent(null)
    })

    return () => {
      active = false
    }
  }, [props.code, props.theme, normalizedLanguage])

  if (!content) {
    return (
      <html.pre style={styles.preFallback}>
        <html.code>{props.code}</html.code>
      </html.pre>
    )
  }

  return <div className={css.props(styles.pre).className} dangerouslySetInnerHTML={{ __html: content }} />
})

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
        <ShikiHighlighter language={language} code={code} theme={isDark ? 'github-dark-high-contrast' : 'github-light-default'} />
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
  preFallback: {
    margin: 0,
    marginTop: 36,
    padding: spacing.padding2,
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
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

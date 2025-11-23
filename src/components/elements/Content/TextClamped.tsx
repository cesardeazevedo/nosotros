import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'

type ViewState = 'fit' | 'clamped' | 'expanded'

type Props = {
  children: ReactNode
  lines?: number
  sx?: SxProps
}

export const TextClamped = memo(function ClampedText(props: Props) {
  const { children, lines = 5, sx } = props
  const ref = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<ViewState>('fit')

  useEffect(() => {
    if (ref.current) {
      const el = ref.current
      if (el.scrollHeight > el.clientHeight) {
        setView('clamped')
      } else {
        setView('fit')
      }
    }
  }, [children])

  return (
    <>
      <html.div ref={ref} style={[styles.root, styles.clamp(lines), view === 'expanded' && styles.expanded, sx]}>
        {children}
      </html.div>
      {view === 'clamped' && (
        <Text
          variant='label'
          size='lg'
          role='button'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setView('expanded')
          }}
          sx={styles.showMore}>
          Show more
        </Text>
      )}
    </>
  )
})

const styles = css.create({
  root: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  clamp: (lines: number) => ({
    WebkitLineClamp: lines,
  }),
  expanded: {
    display: 'block',
    WebkitLineClamp: 'unset',
  },
  showMore: {
    lineHeight: '12px',
    color: palette.tertiary,
    cursor: 'pointer',
    textDecoration: {
      default: 'default',
      ':hover': 'underline',
    },
  },
})

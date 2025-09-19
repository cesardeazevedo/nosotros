import { useNoteContext } from '@/components/providers/NoteProvider'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import type { ReactNode } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  children: ReactNode
}

export const CodeSpan = (props: Props) => {
  const isReply = !useNoteContext().event.metadata?.isRoot
  return <html.span style={[styles.root, isReply && styles.darker, props.sx]}>{props.children}</html.span>
}

const styles = css.create({
  root: {
    padding: '.1em .3em .1em',
    marginInline: 2,
    borderRadius: 6,
    whiteSpace: 'nowrap',
    backgroundColor: palette.surfaceContainerHigh,
  },
  darker: {
    backgroundColor: palette.surfaceContainerHighest,
  },
})

import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import type { ReactNode } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  children: ReactNode
}

export const CodeSpan = (props: Props) => {
  const { dense } = useContentContext()
  return <html.span style={[styles.root, dense && styles.darker, props.sx]}>{props.children}</html.span>
}

const styles = css.create({
  root: {
    padding: '.1em .3em .1em',
    marginInline: 2,
    borderRadius: 6,
    backgroundColor: palette.surfaceContainerHigh,
  },
  darker: {
    backgroundColor: palette.surfaceContainerHighest,
  },
})

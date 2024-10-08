import { palette } from '@/themes/palette.stylex'
import type { ReactNode } from '@tanstack/react-router'
import { css, html } from 'react-strict-dom'

type Props = {
  children: ReactNode
}

export const CodeSpan = (props: Props) => <html.span style={styles.root}>{props.children}</html.span>

const styles = css.create({
  root: {
    padding: '.1em .4em .22em',
    borderRadius: 6,
    backgroundColor: palette.outlineVariant,
  },
})

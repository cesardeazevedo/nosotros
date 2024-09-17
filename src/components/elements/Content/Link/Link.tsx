import { palette } from '@/themes/palette.stylex'
import { typeFace } from '@/themes/typeFace.stylex'
import { css, html } from 'react-strict-dom'

type Props = {
  href?: string
  children: React.ReactNode
}

function Link(props: Props) {
  return (
    <html.a href={props.href} target='_blank' rel='noopener noreferrer' style={styles.root}>
      {props.children}
    </html.a>
  )
}

const styles = css.create({
  root: {
    color: palette.tertiary,
    fontWeight: typeFace.bold,
    ':hover': {
      textDecoration: 'underline',
    },
  },
})

export default Link

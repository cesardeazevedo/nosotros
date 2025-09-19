import { shape } from '@/themes/shape.stylex'
import { css, html } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
}

export const MediaScrim = (props: Props) => {
  return <html.div style={styles.scrim}>{props.children}</html.div>
}

const styles = css.create({
  scrim: {
    position: 'absolute',
    zIndex: 100,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: shape.lg,
  },
})

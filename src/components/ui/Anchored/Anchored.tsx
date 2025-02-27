import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { css, html } from 'react-strict-dom'
import { anchoredTokens } from './Anchored.stylex'

type VerticalPosition = 'top' | 'middle' | 'bottom'
type HorizontalPosition = 'start' | 'center' | 'end'

export type AnchorPosition = `${VerticalPosition}-${HorizontalPosition}`

type Props = {
  position?: AnchorPosition
  content?: React.ReactNode
  invisible?: boolean
  children: React.ReactNode
}

export const Anchored = (props: Props) => {
  const { position = 'top-end', children, content, invisible: invisibleProp } = props

  const invisible = invisibleProp || !content
  const [vertical, horizontal] = position.split('-') as [VerticalPosition, HorizontalPosition]

  return (
    <html.div style={styles.root}>
      {children}
      <html.div style={[styles.content, invisible && styles.invisible, styles[vertical], styles[horizontal]]}>
        {content}
      </html.div>
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    verticalAlign: 'middle',
  },
  invisible: {
    [anchoredTokens.scale]: '0',
  },
  content: {
    position: 'absolute',
    display: 'flex',
    transitionProperty: 'transform',
    transitionDuration: duration.short2,
    transitionTimingFunction: easing.standard,
    transform: `scale(${anchoredTokens.scale}) translate(${anchoredTokens.translateX}, ${anchoredTokens.translateY})`,
    transformOrigin: `${anchoredTokens.originX} ${anchoredTokens.originY}`,
  },
  top: {
    top: anchoredTokens.offset,
    [anchoredTokens.translateY]: '-50%',
    [anchoredTokens.originY]: '0%',
  },
  middle: {
    top: '50%',
    [anchoredTokens.translateY]: '-50%',
    [anchoredTokens.originY]: '0%',
  },
  bottom: {
    bottom: anchoredTokens.offset,
    [anchoredTokens.translateY]: '50%',
    [anchoredTokens.originY]: '100%',
  },
  start: {
    left: anchoredTokens.offset,
    [anchoredTokens.translateX]: '-50%',
    [anchoredTokens.originX]: '0%',
  },
  center: {
    left: '50%',
    [anchoredTokens.translateX]: '-50%',
    [anchoredTokens.originX]: '0%',
  },
  end: {
    right: anchoredTokens.offset,
    [anchoredTokens.translateX]: '50%',
    [anchoredTokens.originX]: '100%',
  },
})

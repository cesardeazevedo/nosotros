import { state } from '@/themes/state.stylex'
import { html, css } from 'react-strict-dom'
import { circularProgressTokens } from './CircularProgress.stylex'

type Props = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
}

export const CircularProgress = (props: Props) => {
  const { size = 'sm', disabled } = props
  return (
    <html.div role='progressbar' style={[styles.root, sizes[size]]}>
      <html.div style={[styles.layer, styles.progress]}>
        <html.div style={[styles.layer, styles.spinner]}>
          <html.div style={[styles.layer, styles.left]}>
            <html.div
              style={[styles.layer, styles.circle, styles.leftCircle, disabled && styles.circle$disabled]}></html.div>
          </html.div>
          <html.div style={[styles.layer, styles.right]}>
            <html.div
              style={[styles.layer, styles.circle, styles.rightCircle, disabled && styles.circle$disabled]}></html.div>
          </html.div>
        </html.div>
      </html.div>
    </html.div>
  )
}

const arcDuration = '1333ms'
const cycleDuration = `calc(4 * ${arcDuration})`

const linearRotateKeyframes = css.keyframes({
  '100%': { transform: 'rotate(360deg)' },
})

const rotateArcKeyframes = css.keyframes({
  '12.5%': { transform: 'rotate(135deg)' },
  '25%': { transform: 'rotate(270deg)' },
  '37.5%': { transform: 'rotate(405deg)' },
  '50%': { transform: 'rotate(540deg)' },
  '62.5%': { transform: 'rotate(675deg)' },
  '75%': { transform: 'rotate(810deg)' },
  '87.5%': { transform: 'rotate(945deg)' },
  '100%': { transform: 'rotate(1080deg)' },
})

const expandArcKeyframes = css.keyframes({
  '0%': { transform: 'rotate(265deg)' },
  '50%': { transform: 'rotate(130deg)' },
  '100%': { transform: 'rotate(265deg)' },
})

const linearRotateDuration = `calc(${arcDuration} * 360 / 306)`
const indeterminateEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'

const color$disabled = `color-mix(in srgb, ${circularProgressTokens.color$disabled} calc(${state.opacity$disabled} * 100%), transparent)`

const sizes = css.create({
  xs: {
    width: '0.9em',
    height: '0.9em',
  },
  sm: {
    width: '1.2em',
    height: '1.2em',
  },
  md: {
    width: '2em',
    height: '2em',
  },
  lg: {
    width: '2.5em',
    height: '2.5em',
  },
  xl: {
    width: '3em',
    height: '3em',
  },
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    verticalAlign: 'middle',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    contain: 'strict',
    borderColor: circularProgressTokens.color,
  },
  layer: {
    position: 'absolute',
    inset: 0,
    borderColor: 'inherit',
  },
  progress: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    alignSelf: 'stretch',
    margin: 0,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationName: linearRotateKeyframes,
    animationDuration: linearRotateDuration,
  },
  spinner: {
    animationIterationCount: 'infinite',
    animationFillMode: 'both',
    animationName: rotateArcKeyframes,
    animationDuration: cycleDuration,
    animationTimingFunction: indeterminateEasing,
  },
  left: {
    overflow: 'hidden',
    inset: '0 50% 0 0',
  },
  right: {
    overflow: 'hidden',
    inset: '0 0 0 50%',
  },
  circle: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderTopColor: 'inherit',
    borderRightColor: 'inherit',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    animationName: expandArcKeyframes,
    animationIterationCount: 'infinite',
    animationFillMode: 'both',
    animationDuration: `${arcDuration}, ${cycleDuration}`,
    animationTimingFunction: indeterminateEasing,
    borderWidth: 2,
  },
  circle$disabled: {
    borderTopColor: color$disabled,
    borderRightColor: color$disabled,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  leftCircle: {
    rotate: '135deg',
    inset: '0 -100% 0 0',
  },
  rightCircle: {
    rotate: '100deg',
    inset: '0 0 0 -100%',
    animationDelay: `calc(-0.5 * ${arcDuration}), 0ms`,
  },
})

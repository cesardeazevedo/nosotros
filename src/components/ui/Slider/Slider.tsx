import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { forwardRef, useCallback, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { FocusRing } from '../FocusRing/FocusRing'
import { Tooltip } from '../Tooltip/Tooltip'
import { dataProps } from '../helpers/dataProps'
import { mergeRefs } from '../helpers/mergeRefs'
import { useControlledValue } from '../hooks/useControlledValue'
import { useVisualState } from '../hooks/useVisualState'
import type { SxProps } from '../types'

type Props = {
  sx?: SxProps
  id?: string
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onChange?: (value: number) => void | Promise<void>
  loading?: boolean
}

export const Slider = forwardRef<HTMLElement, Props>((props, ref) => {
  const { id, sx, disabled = false, min = 0, max = 100, step = 1, onChange } = props
  const { visualState, setRef } = useVisualState(undefined, { retainFocusAfterClick: false })
  const [value, setValue] = useControlledValue<number>({
    default: props.defaultValue ?? min,
    controlled: props.value,
    name: 'value',
    onValueChange: onChange,
  })

  const actionRef = useRef<HTMLInputElement>(null)
  const refs = mergeRefs([ref, setRef, actionRef])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      setValue(newValue)
    },
    [onChange],
  )

  return (
    <html.div style={[styles.root, disabled && styles.disabled, sx]}>
      <html.div style={[styles.slider]}>
        <html.input
          id={id}
          type='range'
          min={min}
          max={max}
          step={step}
          value={value.toString()}
          onChange={disabled ? undefined : handleChange}
          style={styles.input}
          ref={refs}
          disabled={disabled}
        />
        <html.div style={styles.trackContainer}>
          <html.div
            style={[
              styles.filledTrack,
              styles.width(`${((value - min) / (max - min) - (visualState.pressed ? 0.02 : 0.03)) * 100}%`),
              //disabled && styles.filledTrackDisabled,
            ]}
          />
          <html.div
            style={[
              styles.track,
              styles.left(`${((value - min) / (max - min) + (visualState.pressed ? 0.02 : 0.03)) * 100}%`),
              //styles.width(`${((value - min) / (min - max) - 0.04) * 100}%`),
            ]}
          />
        </html.div>
        <html.div
          style={[styles.handler, styles.left(`${((value - min) / (max - min)) * 100}%`)]}
          {...dataProps(visualState)}>
          <Tooltip placement='top' enterDelay={0} text={value}>
            <html.div {...dataProps(visualState)} style={[styles.handlerInner]}>
              <FocusRing sx={styles.focusRing} visualState={visualState} />
            </html.div>
          </Tooltip>
        </html.div>
      </html.div>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    width: '100%',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.38,
  },
  slider: {
    position: 'relative',
    width: '100%',
  },
  input: {
    position: 'absolute',
    width: '100%',
    opacity: 0,
    left: 0,
    top: 0,
    cursor: 'pointer',
  },
  trackContainer: {
    position: 'relative',
    width: '100%',
    height: '16px',
    borderRadius: shape.full,
    pointerEvents: 'none',
  },
  track: {
    position: 'absolute',
    right: 0,
    height: '100%',
    backgroundColor: palette.secondaryContainer,
    borderTopLeftRadius: shape.md,
    borderBottomLeftRadius: shape.md,
    borderTopRightRadius: shape.lg,
    borderBottomRightRadius: shape.lg,
    transitionProperty: 'width',
    transitionDuration: duration.long4,
  },
  filledTrack: {
    position: 'absolute',
    height: '100%',
    backgroundColor: palette.primary,
    borderTopLeftRadius: shape.lg,
    borderBottomLeftRadius: shape.lg,
    borderTopRightRadius: shape.md,
    borderBottomRightRadius: shape.md,
    transitionProperty: 'left',
    transitionDuration: duration.long4,
  },
  handler: {
    position: 'absolute',
    top: '-12px',
    height: '40px',
    marginLeft: '-10px',
    backgroundColor: 'transparent',
    paddingInline: spacing['padding1'],
    pointerEvents: 'none',
  },
  handlerInner: {
    width: {
      default: 4,
      ':is([data-pressed])': 1,
    },
    marginLeft: {
      default: 0,
      ':is([data-pressed])': 2,
    },
    height: 40,
    borderRadius: shape.sm,
    backgroundColor: palette.primary,
    transitionProperty: 'all',
    transitionDuration: duration.short2,
    transitionDelay: easing.emphasized,
  },
  left: (value) => ({ left: value }),
  width: (value) => ({ width: value }),
  focusRing: {
    // width: 40,
    // marginLeft: -8,
    outlineWidth: 2,
    borderRadius: shape.full,
  },
  // Additional styles for disabled, loading, focus, etc.
})

import { outline } from '@/themes/outline.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeFace } from '@/themes/typeFace.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import type { ChangeEvent } from 'react'
import { forwardRef, useCallback, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { dataProps } from '../helpers/dataProps'
import { mergeRefs } from '../helpers/mergeRefs'
import { useVisualState } from '../hooks/useVisualState'
import type { SxProps } from '../types'
import { textFieldTokens } from './TextField.stylex'

type Props = {
  sx?: SxProps
  size?: 'sm' | 'md'
  type?: 'text' | 'number' | 'text' | 'date' | 'email' | 'password'
  error?: boolean
  autoComplete?: boolean
  autoFocus?: boolean
  disabled?: boolean
  fullWidth?: boolean
  id?: string
  label: string
  maxRows?: number
  minRows?: number
  multiline?: boolean
  value?: string
  defaultValue?: string
  onBlur?: () => void
  onFocus?: () => void
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
}

export const TextField = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const {
    sx,
    size = 'md',
    type: inputType = 'text',
    defaultValue,
    error,
    value,
    fullWidth,
    label,
    leading,
    trailing,
    placeholder,
    onBlur,
    onChange,
    onFocus,
  } = props
  const visualStateRef = useRef<HTMLElement>(null)
  const { visualState, setRef } = useVisualState(undefined, { retainFocusAfterClick: true })
  const refs = mergeRefs([setRef, visualStateRef, ref])

  const [filled, setFilled] = useState(() => {
    if (defaultValue && defaultValue !== '') {
      return true
    }
    return false
  })

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFilled(!!value && value !== '')
    onChange?.(e)
  }, [])

  const shrink = visualState.focused || filled

  return (
    <html.div
      style={[styles.root, fullWidth && styles.fullWidth, sizes[size], sx]}
      {...dataProps(visualState)}
      data-shrink={shrink}>
      <html.label style={styles.label}>{label}</html.label>
      <html.div style={styles.content} {...dataProps(visualState)} data-shrink={shrink}>
        {leading && (
          <html.div style={styles.leading} {...dataProps(visualState)} data-shrink={shrink}>
            {leading}
          </html.div>
        )}
        <html.input
          type={inputType}
          ref={refs}
          style={styles.input}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          {...dataProps(visualState)}
          data-shrink={shrink}
          aria-invalid={!!error}
          aria-label={label}
        />
        {trailing && <html.div style={styles.trailing}>{trailing}</html.div>}
        <html.fieldset style={[styles.fieldset, error && styles.fieldset$error]}>
          <legend {...css.props(styles.legend)}>
            <html.span>{label}</html.span>
          </legend>
        </html.fieldset>
      </html.div>
    </html.div>
  )
})

const sizes = css.create({
  sm: {
    [textFieldTokens.containerMinHeight]: 40,
    [textFieldTokens.labelPosition]: {
      default: 'translate(20px, 8px) scale(1)',
      ':is([data-shrink="true"])': 'translate(20px, -9px) scale(0.75)',
    },
  },
  md: {
    [textFieldTokens.containerMinHeight]: 56,
    [textFieldTokens.labelPosition]: {
      default: 'translate(20px, 16px) scale(1)',
      ':is([data-shrink="true"])': 'translate(20px, -9px) scale(0.75)',
    },
  },
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    flexDirection: 'column',
    position: 'relative',
    minWidth: 0,
    padding: 0,
    border: 0,
    verticalAlign: 'top',
    height: textFieldTokens.containerMinHeight,
    [textFieldTokens.outlineLegend]: {
      default: '0.01px',
      ':is([data-shrink="true"])': '100%',
    },
    [textFieldTokens.outlineWidth]: {
      default: outline.xs,
      ':is([data-focused])': outline.sm,
    },
    [textFieldTokens.outlineColor]: {
      default: palette.outline,
      ':is([data-hovered])': palette.onSurface,
      ':is([data-focused])': palette.primary,
    },
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: typeFace.medium,
    fontSize: typeScale.bodySize$lg,
    lineHeight: typeScale.bodyLineHeight$lg,
    letterSpacing: typeScale.bodyLetterSpacing$lg,
    display: 'block',
    textOverflow: 'ellipsis',
    position: 'absolute',
    left: '0px',
    top: '0px',
    transformOrigin: 'left top',
    // zIndex: 1,
    userSelect: 'none',
    pointerEvents: 'auto',
    maxWidth: 'calc(133% - 32px)',
    transform: textFieldTokens.labelPosition,
    padding: '0px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition:
      'color 200ms cubic-bezier(0, 0, 0.2, 1), transform 200ms cubic-bezier(0, 0, 0.2, 1), max-width 200ms cubic-bezier(0, 0, 0.2, 1)',
  },
  input: {
    border: 0,
    height: textFieldTokens.containerMinHeight,
    display: 'block',
    width: '100%',
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding1,
    outline: 'none',
    opacity: {
      default: 1,
      ':is(:not([data-shrink="true"]))': 0,
    },
  },
  content: {
    fontWeight: 400,
    fontSize: typeScale.bodySize$lg,
    lineHeight: typeScale.bodyLineHeight$lg,
    letterSpacing: typeScale.bodyLetterSpacing$lg,
    color: palette.onSurface,
    boxSizing: 'border-box',
    cursor: 'text',
    display: 'inline-flex',
    WebkitBoxAlign: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fieldset: {
    textAlign: 'left',
    position: 'absolute',
    inset: '-5px 0px 0px',
    margin: 0,
    padding: '0px 10px',
    pointerEvents: 'none',
    borderRadius: shape.lg,
    borderStyle: 'solid',
    overflow: 'hidden',
    minWidth: '0%',
    borderWidth: textFieldTokens.outlineWidth,
    borderColor: textFieldTokens.outlineColor,
  },
  fieldset$error: {
    borderColor: 'red',
  },
  legend: {
    float: 'unset',
    width: 'auto',
    display: 'block',
    padding: 0,
    height: 11,
    marginLeft: 6,
    maxWidth: textFieldTokens.outlineLegend,
    fontSize: '78%',
    visibility: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 50ms',
  },
  legendSpan: {
    paddingLeft: 5,
    paddingRight: 5,
    display: 'block',
    opacity: 0,
    visibility: 'visible',
  },
  leading: {
    display: 'inline-flex',
    justifyContent: 'center',
    minWidth: 40,
    paddingLeft: spacing.padding1,
    opacity: {
      default: 0,
      ':is([data-shrink="true"])': 1,
      ':is([data-hovered])': 1,
    },
  },
  trailing: {
    display: 'inline-flex',
    justifyContent: 'center',
    minWidth: 40,
    paddingRight: spacing.padding1,
  },
})

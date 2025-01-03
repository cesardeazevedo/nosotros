import React, { forwardRef, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { buttonTokens } from '../Button/Button.stylex'
import { FocusRing } from '../FocusRing/FocusRing'
import { focusRingTokens } from '../FocusRing/FocusRing.stylex'
import { dataProps } from '../helpers/dataProps'
import { mergeRefs } from '../helpers/mergeRefs'
import type { IVisualState } from '../hooks/useRipple'
import { useVisualState } from '../hooks/useVisualState'
import { Ripple } from '../Ripple/Ripple'
import type { SxProps } from '../types'

export type Props = {
  sx?: SxProps
  tabIndex?: 0 | -1
  children?: React.ReactNode
  outlined?: boolean
  disabled?: boolean
  disabledRipple?: boolean
  visualState?: IVisualState
  onClick?: (e: StrictClickEvent) => void
}

export const ButtonBase = forwardRef<HTMLButtonElement, Props>(function ButtonBase(props, ref) {
  const { children, sx, outlined, disabled = false, disabledRipple = false, onClick, tabIndex, ...rest } = props
  const visualStateRef = useRef<HTMLElement>(null)
  const { visualState, setRef } = useVisualState(props.visualState)
  const allRefs = mergeRefs([setRef, ref, visualStateRef])
  return (
    <html.button
      role='button'
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      ref={allRefs}
      onClick={(e) => onClick?.(e)}
      style={[styles.root, disabled && styles.disabled, sx]}
      {...dataProps(visualState)}
      {...rest}>
      {!!outlined && <html.div style={[styles.outline, disabled && styles.outline$disabled]} />}
      <html.div style={[styles.background, disabled && styles.background$disabled]} />
      {!disabled && <FocusRing />}
      {!disabledRipple && <Ripple disabled={disabled} visualState={visualState} element={visualStateRef} />}
      {children}
    </html.button>
  )
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
    textDecoration: 'none',
    borderWidth: 0,
    borderRadius: 'inherit',
    [focusRingTokens.shape]: buttonTokens.containerShape,
  },
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
  },
  background: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    backgroundColor: buttonTokens.containerColor,
  },
  background$disabled: {
    backgroundColor: buttonTokens.containerColor$disabled,
    opacity: buttonTokens.containerOpacity$disabled,
  },
  outline: {
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    position: 'absolute',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: buttonTokens.outlineColor,
  },
  outline$disabled: {
    borderColor: buttonTokens.outlineColor$disabled,
    opacity: buttonTokens.outlineOpacity$disabled,
  },
})

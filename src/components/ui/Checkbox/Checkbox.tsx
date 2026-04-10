import { IconCheck } from '@tabler/icons-react'
import type React from 'react'
import { forwardRef, useCallback, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { FocusRing } from '../FocusRing/FocusRing'
import { focusRingTokens } from '../FocusRing/FocusRing.stylex'
import { dataProps } from '../helpers/dataProps'
import { mergeRefs } from '../helpers/mergeRefs'
import { useVisualState } from '../hooks/useVisualState'
import type { SxProps } from '../types'
import { checkboxTokens } from './Checkbox.stylex'

type Props = {
  sx?: SxProps
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: React.InputHTMLAttributes<HTMLInputElement>['onChange']
}

export const Checkbox = forwardRef<HTMLElement, Props>((props, ref) => {
  const { id, sx, disabled, onChange } = props
  const { visualState, setRef } = useVisualState()
  const [checked, setChecked] = useState(props.checked)

  const actionRef = useRef<HTMLInputElement>(null)
  const refs = mergeRefs([ref, setRef, actionRef])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const response = onChange?.(e) || Promise.resolve()
      response.then(() => {
        setChecked((prev) => !prev)
      })
    },
    [onChange],
  )

  return (
    <html.div style={[styles.root, disabled && styles.disabled, sx]}>
      <html.div
        style={[
          styles.box,
          checked && styles.box$checked,
          disabled && styles.box$disabled,
          checked && disabled && styles.box$checked$disabled,
        ]}
        {...dataProps(visualState)}>
        <html.input
          id={id}
          type='checkbox'
          checked={checked}
          onChange={disabled ? undefined : handleChange}
          style={styles.input}
          ref={refs}
        />
        <FocusRing visualState={visualState} />
        {checked && (
          <html.span style={styles.icon}>
            <IconCheck size={14} strokeWidth={3.5} />
          </html.span>
        )}
      </html.div>
    </html.div>
  )
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
  },
  box: {
    position: 'relative',
    width: checkboxTokens.size,
    height: checkboxTokens.size,
    borderRadius: checkboxTokens.shape,
    borderStyle: 'solid',
    borderWidth: checkboxTokens.borderWidth,
    borderColor: {
      default: checkboxTokens.borderColor,
      ':is([data-hovered])': checkboxTokens.borderColor$hover,
      ':is([data-focused])': checkboxTokens.borderColor$focus,
      ':is([data-pressed])': checkboxTokens.borderColor$focus,
    },
    backgroundColor: {
      default: checkboxTokens.backgroundColor,
      ':is([data-hovered])': checkboxTokens.backgroundColor$hover,
      ':is([data-focused])': checkboxTokens.backgroundColor$focus,
      ':is([data-pressed])': checkboxTokens.backgroundColor$focus,
    },
    color: 'currentColor',
    [focusRingTokens.shape]: checkboxTokens.shape,
  },
  box$checked: {
    borderColor: {
      default: checkboxTokens.selectedColor,
      ':is([data-hovered])': checkboxTokens.selectedColor$hover,
      ':is([data-focused])': checkboxTokens.selectedColor$focus,
      ':is([data-pressed])': checkboxTokens.selectedColor$focus,
    },
    backgroundColor: {
      default: checkboxTokens.selectedColor,
      ':is([data-hovered])': checkboxTokens.selectedColor$hover,
      ':is([data-focused])': checkboxTokens.selectedColor$focus,
      ':is([data-pressed])': checkboxTokens.selectedColor$focus,
    },
    color: checkboxTokens.selectedIconColor,
  },
  box$disabled: {
    borderColor: checkboxTokens.borderColor$disabled,
    backgroundColor: checkboxTokens.backgroundColor$disabled,
    opacity: checkboxTokens.disabledOpacity,
  },
  box$checked$disabled: {
    borderColor: checkboxTokens.selectedColor$disabled,
    backgroundColor: checkboxTokens.selectedColor$disabled,
    opacity: checkboxTokens.disabledOpacity,
    color: checkboxTokens.selectedIconColor,
  },
  input: {
    appearance: 'none',
    width: checkboxTokens.stateLayerSize,
    height: checkboxTokens.stateLayerSize,
    outline: 'none',
    margin: 0,
    border: 0,
    position: 'absolute',
    inset: '50%',
    transform: 'translate(-50%, -50%)',
    cursor: 'inherit',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  icon: {
    position: 'absolute',
    inset: 0,
    margin: 'auto',
    width: checkboxTokens.iconSize,
    height: checkboxTokens.iconSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
})

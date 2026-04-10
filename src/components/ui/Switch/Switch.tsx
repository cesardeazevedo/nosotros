import { IconLoader } from '@tabler/icons-react'
import type React from 'react'
import { forwardRef, useCallback, useRef, useState } from 'react'
import { html } from 'react-strict-dom'
import { FocusRing } from '../FocusRing/FocusRing'
import { dataProps } from '../helpers/dataProps'
import { mergeRefs } from '../helpers/mergeRefs'
import { useVisualState } from '../hooks/useVisualState'
import type { SxProps } from '../types'
import { styles } from './Switch.styles'

type Props = {
  sx?: SxProps
  id?: string
  checked?: boolean
  defaultChecked?: boolean
  icons?: boolean
  showOnlySelectedIcon?: boolean
  disabled?: boolean
  onChange?: React.InputHTMLAttributes<HTMLInputElement>['onChange']
  icon?: React.ReactNode
  selectedIcon?: React.ReactNode
  loading?: boolean
}

export const Switch = forwardRef<HTMLElement, Props>((props, ref) => {
  const { id, sx, disabled, icon, onChange, showOnlySelectedIcon, selectedIcon, checked: checkedProp, defaultChecked, loading: loadingProp } = props
  const { visualState, setRef } = useVisualState()
  const [checkedState, setCheckedState] = useState(Boolean(defaultChecked ?? checkedProp))
  const checked = checkedProp ?? checkedState
  const loading = Boolean(loadingProp)
  const hasIcons = !!icon || !!selectedIcon || loading
  const shouldShowIcons = !!hasIcons || !!showOnlySelectedIcon

  const actionRef = useRef<HTMLInputElement>(null)
  const refs = mergeRefs([ref, setRef, actionRef])
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      if (checkedProp === undefined) {
        setCheckedState((prev) => !prev)
      }
    },
    [checkedProp, onChange],
  )
  return (
    <html.div style={[styles.root, disabled && styles.disabled, sx]}>
      <html.div style={[styles.switch, checked && styles.selected]}>
        <html.input
          id={id}
          type='checkbox'
          role='switch'
          checked={checked}
          onChange={disabled ? undefined : handleChange}
          style={styles.input}
          ref={refs}
        />
        <FocusRing visualState={visualState} />
        <html.span style={styles.track}>
          <html.div
            style={[
              styles.background,
              disabled && styles.background$disabled,
              styles.trackBackground,
              checked && styles.trackBackground$selected,
              disabled && (checked ? styles.trackBackground$disabled$selected : styles.trackBackground$disabled),
            ]}
          />
          <html.span
            style={[styles.container, checked && styles.container$selected, disabled && styles.container$disabled]}
            {...dataProps(visualState)}>
            <html.span aria-hidden style={styles.stateLayer} {...dataProps(visualState)} />
            <html.span
              style={[
                styles.handle,
                checked && styles.handle$selected,
                loading && styles.handle$loading,
                hasIcons && styles.handle$withIcon,
              ]}>
              <html.div
                style={[
                  styles.background,
                  styles.handleBackground,
                  checked && styles.handleBackground$selected,
                  disabled && (checked ? styles.handleBackground$disabled$selected : styles.handleBackground$disabled),
                ]}
                {...dataProps(visualState)}
              />
              {shouldShowIcons && (
                <html.div style={styles.icons}>
                  <html.div
                    style={[
                      styles.icon,
                      !loading && (checked ? styles.icon$size$selected : styles.icon$size),
                      checked && styles.icon$on$selected,
                      checked && disabled && styles.icon$on$selected$disabled,
                    ]}>
                    {loading ? <IconLoader size={18} /> : selectedIcon}
                  </html.div>
                  {!showOnlySelectedIcon && (
                    <html.div
                      style={[
                        styles.icon,
                        !loading && (checked ? styles.icon$size$selected : styles.icon$size),
                        !checked && styles.icon$on,
                        !checked && disabled && styles.icon$on$disabled,
                      ]}>
                      {loading ? <IconLoader size={18} /> : icon}
                    </html.div>
                  )}
                </html.div>
              )}
            </html.span>
          </html.span>
        </html.span>
      </html.div>
    </html.div>
  )
})

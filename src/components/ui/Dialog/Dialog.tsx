import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import { PopoverBase } from '../Popover/PopoverBase'
import type { SxProps } from '../types'
import type { IPopoverBaseProps } from '../Popover/PopoverBase.types'

export type Props = {
  sx?: SxProps
  open?: boolean
  onClose?: () => void
  disabled?: boolean
  modal?: boolean
  children?: React.ReactNode
  slotProps?: IPopoverBaseProps['slotProps']
  trapFocus?: boolean
}

export const Dialog = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { open, onClose, modal, disabled, children, sx, slotProps, trapFocus = true } = props
  return (
    <PopoverBase
      sx={[styles.root, sx]}
      opened={open}
      onClose={onClose}
      ref={ref}
      contentRenderer={() => children}
      floatingStrategy={false}
      placement='top'
      slotProps={slotProps}
      closeEvents={{
        focusOut: false,
        clickOutside: !modal,
        escapeKey: !modal,
      }}
      trapFocus={trapFocus}
      withScrim
      middlewares={{
        flip: false,
        shift: false,
        size: false,
      }}
      disabled={disabled}
    />
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    overflow: 'auto',
    zIndex: 200,
    margin: 'auto',
    maxHeight: '100%',
  },
})

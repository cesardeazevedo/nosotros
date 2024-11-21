import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import { PopoverBase } from '../Popover/PopoverBase'
import type { SxProps } from '../types'

export type Props = {
  sx?: SxProps
  open?: boolean
  onClose?: () => void
  disabled?: boolean
  modal?: boolean
  children?: React.ReactNode
}

export const Dialog = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { open, onClose, modal, disabled, children, sx } = props
  return (
    <PopoverBase
      sx={[styles.root, sx]}
      opened={open}
      onClose={onClose}
      ref={ref}
      contentRenderer={() => children}
      floatingStrategy={false}
      placement='top'
      closeEvents={{
        focusOut: false,
        clickOutside: !modal,
        escapeKey: !modal,
      }}
      trapFocus
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
    zIndex: 400,
    margin: 'auto',
    maxHeight: 'calc(100% - 100px)',
  },
})

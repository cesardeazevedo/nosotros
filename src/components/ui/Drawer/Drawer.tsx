import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import { PopoverBase } from '../Popover/PopoverBase'
import type { IPopoverBaseProps } from '../Popover/PopoverBase.types'
import type { SxProps } from '../types'

export type Props = {
  sx?: SxProps
  opened?: boolean
  defaultOpen?: boolean
  onClose?: () => void
  disabled?: boolean
  anchor?: 'left' | 'right' | 'top' | 'bottom'
  children?: React.ReactNode
  slotProps?: IPopoverBaseProps['slotProps']
}

export const Drawer = forwardRef<HTMLDivElement, Props>(function Drawer(props, ref) {
  const { sx, opened, onClose, defaultOpen, anchor = 'left', children, disabled } = props
  const orientation = ['left', 'right'].includes(anchor as string) ? 'vertical' : 'horizontal'

  return (
    <PopoverBase
      sx={[styles.root, styles[`root$${orientation}`], styles[`root$${anchor}`], sx]}
      opened={opened}
      defaultOpened={defaultOpen}
      onClose={onClose}
      closeEvents={{ clickOutside: true }}
      contentRenderer={children}
      floatingStrategy={false}
      placement={anchor}
      trapFocus
      preventAutoFocus
      withScrim
      slotProps={{
        scrim: props.slotProps?.scrim,
        floatingFocusManager: {
          visuallyHiddenDismiss: true,
        },
        floatingTransition: {
          ...props.slotProps?.floatingTransition,
          sx: [styles.content, styles[`content$${orientation}`], props.slotProps?.floatingTransition?.sx],
        },
      }}
      middlewares={{
        flip: false,
        shift: false,
        size: false,
      }}
      disabled={disabled}
      ref={ref}
    />
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    zIndex: 300,
  },
  root$vertical: {
    top: 0,
    bottom: 0,
    height: `100vh`,
  },
  root$horizontal: {
    left: 0,
    right: 0,
  },
  root$left: {
    left: 0,
  },
  root$right: {
    right: 0,
  },
  root$top: {
    top: 0,
  },
  root$bottom: {
    bottom: 0,
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    position: 'relative',
    zIndex: 1,
  },
  content$vertical: {
    height: '100%',
  },
  content$horizontal: {
    width: '100%',
  },
})

import {
  Box,
  DialogProps,
  DialogTitle,
  Dialog as MuiDialog,
  Slide,
  SwipeableDrawer,
  SwipeableDrawerProps,
} from '@mui/material'

import { TransitionProps } from '@mui/material/transitions'
import { useMobile } from 'hooks/useMobile'
import React, { JSXElementConstructor, ReactNode } from 'react'

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  sx?: DialogProps['sx']
  maxWidth?: DialogProps['maxWidth']
  children: ReactNode
  mobileHeight?: string | number
  mobileSlots?: SwipeableDrawerProps['slotProps']
  desktopAnimation?: boolean
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown, string | JSXElementConstructor<unknown>>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export function MobileDialog(props: Props) {
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const { open, onClose, children, mobileHeight, sx, mobileSlots } = props
  return (
    <SwipeableDrawer
      disableDiscovery={iOS}
      keepMounted={false}
      anchor='bottom'
      open={open}
      onOpen={() => {}}
      onClose={onClose}
      minFlingVelocity={800}
      ModalProps={{ keepMounted: false }}
      // slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 1)' } } }}
      slotProps={mobileSlots}
      PaperProps={{
        sx: {
          height: mobileHeight ? mobileHeight : '100%',
          borderTopRightRadius: mobileHeight ? 20 : 0,
          borderTopLeftRadius: mobileHeight ? 20 : 0,
          backgroundImage: 'var(--mui-overlays-2)',
          zIndex: 10000000,
          overflowX: 'hidden', // needs some investigation here
          ...sx,
        },
      }}>
      {mobileHeight && (
        <Box sx={{ backgroundColor: 'divider', width: 54, minHeight: 6, borderRadius: 8, m: '14px auto' }} />
      )}
      {children}
    </SwipeableDrawer>
  )
}

function Dialog(props: Props) {
  const { open, onClose, children, title, desktopAnimation = true, maxWidth = 'md', sx } = props
  const isMobile = useMobile()
  return (
    <>
      {isMobile && <MobileDialog {...props} />}
      {!isMobile && (
        <MuiDialog
          fullWidth
          keepMounted={false}
          open={open}
          onClose={onClose}
          maxWidth={maxWidth}
          TransitionComponent={desktopAnimation ? Transition : undefined}
          PaperProps={{ sx: { backgroundImage: 'var(--mui-overlays-2)', ...sx } }}>
          {title && <DialogTitle>{title}</DialogTitle>}
          {children}
        </MuiDialog>
      )}
    </>
  )
}

export default Dialog

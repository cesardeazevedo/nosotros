import { Dialog } from '@/components/ui/Dialog/Dialog'
import type { Props as DialogContentProps } from '@/components/ui/DialogContent/DialogContent'
import { DialogContent } from '@/components/ui/DialogContent/DialogContent'
import { DrawerSwipeable } from '@/components/ui/Drawer/DrawerSwipeable'
import { Paper } from '@/components/ui/Paper/Paper'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { useMobile } from 'hooks/useMobile'
import { type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  sx?: SxProps
  children: ReactNode
  surface?: DialogContentProps['surface'] | false
  maxWidth?: DialogContentProps['maxWidth']
  mobileAnchor?: 'middle' | 'full'
}

function MobileDialog(props: Props) {
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const { sx, open, onClose, children, mobileAnchor } = props
  return (
    <DrawerSwipeable
      disableDiscovery={iOS}
      anchor='bottom'
      opened={open}
      sx={[styles.drawer, !!mobileAnchor && styles[`drawer$${mobileAnchor}`]]}
      onClose={onClose}
      slotProps={{ floatingTransition: { sx: styles.floating } }}>
      <Paper
        surface='surfaceContainerLowest'
        sx={[styles.drawerPaper, !!mobileAnchor && styles[`mobilePaper$${mobileAnchor}`], sx]}>
        {!!mobileAnchor && <html.div style={styles.handler} />}
        {children}
      </Paper>
    </DrawerSwipeable>
  )
}

export const DialogSheet = (props: Props) => {
  const { children, surface = 'surfaceContainerLowest' } = props
  const isMobile = useMobile()
  return (
    <>
      {isMobile && <MobileDialog {...props} />}
      {!isMobile && (
        <Dialog {...props}>
          {surface ? (
            <DialogContent shape='lg' surface={surface} maxWidth={props.maxWidth} sx={styles.paper}>
              {children}
            </DialogContent>
          ) : (
            children
          )}
        </Dialog>
      )}
    </>
  )
}

const styles = css.create({
  handler: {
    backgroundColor: palette.surfaceContainerHighest,
    width: 54,
    minHeight: 6,
    borderRadius: shape.full,
    margin: '14px auto',
  },
  drawer: {
    height: '100%',
  },
  drawer$middle: {
    height: '50%',
  },
  drawer$full: {
    height: '90%',
  },
  floating: {
    height: '100vh',
  },
  paper: {},
  drawerPaper: {
    height: '100%',
    borderRadius: shape.none,
    zIndex: 10000,
  },
  mobilePaper$middle: {
    borderTopRightRadius: shape.lg,
    borderTopLeftRadius: shape.lg,
  },
  mobilePaper$full: {
    borderTopRightRadius: shape.lg,
    borderTopLeftRadius: shape.lg,
  },
})

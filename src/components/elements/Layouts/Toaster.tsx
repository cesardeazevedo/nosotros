import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { useMobile } from '@/hooks/useMobile'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { toastStore } from '@/stores/ui/toast.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { css, html } from 'react-strict-dom'

export const Toaster = observer(function Toaster() {
  const toast = toastStore.peek
  const isMobile = useMobile()
  const { theme } = useGlobalSettings()

  useEffect(() => {
    if (toast && toast.duration) {
      setTimeout(() => {
        toastStore.dequeue()
      }, toast.duration)
    }
  }, [toast])

  return (
    <html.div style={[styles.root, isMobile && styles.root$mobile]}>
      <PopoverBase
        opened={toast?.open || false}
        placement={isMobile ? 'bottom' : 'bottom-start'}
        contentRenderer={
          <Paper
            elevation={2}
            sx={typeof toast?.component === 'string' && styles.paper}
            surface={theme === 'dark' ? 'surfaceContainer' : 'surfaceContainerLow'}>
            {toast?.component}
          </Paper>
        }>
        {({ getProps, setRef }) => <html.div {...getProps()} ref={setRef} style={styles.anchor}></html.div>}
      </PopoverBase>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    top: 70,
    right: 20,
  },
  root$mobile: {
    top: 'unset',
    left: 0,
    bottom: 124,
    right: 0,
  },
  anchor: {
    marginTop: spacing.margin2,
  },
  paper: {
    minWidth: 200,
    padding: spacing.padding2,
  },
})

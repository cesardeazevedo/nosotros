import { dequeueToastAtom, peekToastAtom } from '@/atoms/toaster.atoms'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useEffect } from 'react'
import { css, html } from 'react-strict-dom'

export const Toaster = memo(function Toaster() {
  const toast = useAtomValue(peekToastAtom)
  const dequeue = useSetAtom(dequeueToastAtom)
  const isMobile = useMobile()

  useEffect(() => {
    if (toast && toast.duration) {
      setTimeout(() => {
        dequeue()
      }, toast.duration)
    }
  }, [toast])

  return (
    <html.div style={[styles.root, isMobile && styles.root$mobile]}>
      <PopoverBase
        disableScrim
        floatingStrategy='fixed'
        opened={toast?.open || false}
        placement={isMobile ? 'top' : 'bottom-start'}
        contentRenderer={
          <Paper
            elevation={2}
            sx={typeof toast?.component === 'string' && styles.paper}
            surface={'surfaceContainerLow'}>
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
    left: 0,
    top: 24,
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

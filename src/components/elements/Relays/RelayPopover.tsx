import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { relayStore } from 'stores/nostr/relays.store'
import { authStore } from 'stores/ui/auth.store'
import { RelayIconButton } from './RelayIconButton'
import RelayList from './RelayList'
import RelayListOthers from './RelayListOthers'

const RelaysPopover = observer(function RelaysPopover() {
  const [open, setOpen] = useState(false)

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <PopoverBase
      opened={open}
      onClose={handleClose}
      placement='bottom-end'
      contentRenderer={() => (
        <Paper elevation={2} surface='surfaceContainerLowest' sx={styles.root}>
          <html.div style={styles.header}>
            <Text variant='label' size='lg'>
              {authStore.pubkey ? 'My Relays' : 'Relays'}
            </Text>
          </html.div>
          <Divider />
          <html.div style={styles.content}>
            {authStore.pubkey ? (
              <RelayList relays={relayStore.myRelays} />
            ) : (
              <RelayListOthers relays={relayStore.others} />
            )}
          </html.div>
          <Divider />
          {authStore.pubkey && (
            <Stack horizontal={false} sx={styles.footer}>
              <Expandable
                trigger={({ expand, expanded }) => (
                  <html.div onClick={() => expand(!expanded)} style={styles.otherRelays}>
                    <Text variant='label' size='lg'>
                      Other Relays ({relayStore.others.length})
                    </Text>
                  </html.div>
                )}>
                <>
                  <Divider />
                  <html.div style={styles.wrapper}>
                    <RelayListOthers relays={relayStore.others} />
                  </html.div>
                </>
              </Expandable>
            </Stack>
          )}
        </Paper>
      )}>
      {({ getProps, setRef }) => (
        <html.span ref={setRef} {...getProps()}>
          <RelayIconButton onClick={handleOpen} />
        </html.span>
      )}
    </PopoverBase>
  )
})

const styles = css.create({
  root: {
    minWidth: 250,
    maxWidth: 300,
  },
  header: {
    padding: spacing.padding2,
  },
  content: {
    padding: spacing.padding1,
    maxHeight: 350,
    overflowY: 'auto',
  },
  wrapper: {
    padding: spacing.padding1,
  },
  otherRelays: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  footer: {
    cursor: 'pointer',
    overflow: 'hidden',
  },
})

export default RelaysPopover

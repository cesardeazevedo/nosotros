import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconChevronDown,
  IconChevronRight,
  IconDatabaseSearch,
  IconLayoutBottombarCollapse,
  IconLayoutBottombarExpand,
  IconMailSearch,
} from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { RelayIconButton } from './RelayIconButton'
import { RelayUserChipList } from './RelayUserChipList'

export const RelayPopoverSummary = observer(function RelayPopoverSummary() {
  const user = useCurrentUser()

  return (
    <Popover
      floatingStrategy='fixed'
      placement='bottom-end'
      contentRenderer={() => (
        <Paper elevation={2} surface='surfaceContainerLow' sx={styles.root}>
          <html.div style={styles.header}>
            <Text variant='label' size='lg'>
              My Relays
            </Text>
          </html.div>
          <Divider />
          <Expandable
            initiallyExpanded
            trigger={({ expand, expanded }) => (
              <>
                <Stack gap={1} onClick={() => expand(!expanded)} sx={styles.subheader}>
                  <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
                  {/* Hacky icon for outbox */}
                  <IconLayoutBottombarExpand size={22} strokeWidth='1.5' />
                  <Text variant='label' size='lg'>
                    Outbox Relays {user?.outboxRelays?.length ? `(${user.outboxRelays.length || ''})` : '0'}
                  </Text>
                </Stack>
                <Divider />
              </>
            )}>
            {user && (
              <Stack gap={1} horizontal={false} sx={styles.content}>
                <Text>These are the relays you are writing notes to</Text>
                <RelayUserChipList relays={user.outboxRelays} />
              </Stack>
            )}
          </Expandable>
          <Expandable
            trigger={({ expand, expanded }) => (
              <>
                <Stack gap={1} onClick={() => expand(!expanded)} sx={styles.subheader}>
                  <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
                  <IconLayoutBottombarCollapse size={22} strokeWidth='1.5' />
                  <Text variant='label' size='lg'>
                    Inbox Relays {user?.inboxRelays?.length ? `(${user.inboxRelays.length || ''})` : '0'}
                  </Text>
                </Stack>
                <Divider />
              </>
            )}>
            {user && (
              <Stack gap={1} horizontal={false} sx={styles.content}>
                <Text>These are the relays where others will reply or tag you</Text>
                <RelayUserChipList relays={user.inboxRelays} />
              </Stack>
            )}
          </Expandable>
          <Expandable
            initiallyExpanded={false}
            trigger={({ expand, expanded }) => (
              <>
                <Stack gap={1} onClick={() => expand(!expanded)} sx={styles.subheader}>
                  <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
                  {/* <IconDatabaseSearch size={22} strokeWidth='1.5' /> */}
                  <Text variant='label' size='lg'>
                    Local Cache Relays
                  </Text>
                </Stack>
                {expanded && <Divider />}
              </>
            )}>
            <Stack gap={1} horizontal={false} sx={styles.content} align='flex-start'>
              <Text>Local cache relays runs in your machine only, it's used to cache events and faster lookups</Text>
              <Chip icon={<IconDatabaseSearch size={18} strokeWidth='1.5' />} variant='filter' label='Browser Relay' />
              {/* <RelaySelectPopover onSubmit={() => {}} /> */}
            </Stack>
          </Expandable>
          {/* eslint-disable-next-line no-constant-binary-expression */}
          {false && (
            <Expandable
              initiallyExpanded={false}
              trigger={({ expand, expanded }) => (
                <>
                  <Stack gap={1} onClick={() => expand(!expanded)} sx={styles.subheader}>
                    <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
                    <IconMailSearch size={22} strokeWidth='1.5' />
                    <Text variant='label' size='lg'>
                      Search Relays
                    </Text>
                  </Stack>
                  {expanded && <Divider />}
                </>
              )}>
              <Stack gap={1} horizontal={false} sx={styles.content} align='flex-start'>
                Coming Soon
              </Stack>
            </Expandable>
          )}
        </Paper>
      )}>
      {({ getProps, setRef, open }) => (
        <html.span ref={setRef} {...getProps()}>
          <RelayIconButton onClick={open} />
        </html.span>
      )}
    </Popover>
  )
})

const styles = css.create({
  root: {
    minWidth: 280,
    maxWidth: 280,
  },
  header: {
    padding: spacing.padding2,
  },
  subheader: {
    cursor: 'pointer',
    padding: spacing.padding1,
  },
  content: {
    padding: spacing.padding1,
    maxHeight: 210,
    overflowY: 'auto',
  },
  outbox: {
    maxHeight: 250,
    overflowY: 'auto',
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

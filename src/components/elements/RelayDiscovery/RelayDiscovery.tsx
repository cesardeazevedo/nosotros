import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useRootContext } from '@/hooks/useRootStore'
import { subscribeRelayDiscorvery } from '@/nostr/operators/subscribeRelayDiscovery'
import { relayDiscoveryStore } from '@/stores/relayDiscovery/relayDiscovery.store'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown } from '@tabler/icons-react'
import { Await } from '@tanstack/react-router'
import { Observer, observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { firstValueFrom, timer } from 'rxjs'
import { PaperContainer } from '../Layouts/PaperContainer'
import { UserHeader } from '../User/UserHeader'
import { UserName } from '../User/UserName'
import { UserNIP05 } from '../User/UserNIP05'
import { RelayDiscoveryRow } from './RelayDiscoveryRow'
import { RelayDiscoveryRowLoading } from './RelayDiscoveryRowLoading'
import { RelayDiscoveryTableHeader } from './RelayDiscoveryTableHeader'

export const RelayDiscovery = observer(function RelayDiscovery() {
  const client = useRootContext().client
  const promise = useMemo(() => firstValueFrom(timer(3200)), [])
  const sub = useObservable(() => subscribeRelayDiscorvery(client))
  useSubscription(sub)
  return (
    <Stack horizontal gap={1} justify='space-between' align='flex-start'>
      <PaperContainer elevation={1}>
        <Stack horizontal={false} sx={styles.box}>
          <Stack gap={0.5} sx={styles.header} justify='space-between'>
            <Text variant='title' size='md'>
              Relay Discovery
            </Text>
            <div>
              <ContentProvider value={{ disablePopover: true, disableLink: true }}>
                <Popover
                  contentRenderer={({ close }) => (
                    <MenuList surface='surfaceContainerLowest'>
                      <Stack horizontal={false} gap={0.5}>
                        {relayDiscoveryStore.listMonitors.map((monitor) => (
                          <MenuItem
                            key={monitor}
                            label={<UserName size='md' pubkey={monitor} />}
                            supportingText={<UserNIP05 pubkey={monitor} />}
                            onClick={() => {
                              relayDiscoveryStore.select(monitor)
                              close()
                            }}
                            sx={styles.menuItem}
                          />
                        ))}
                      </Stack>
                    </MenuList>
                  )}>
                  {({ getProps, setRef, open }) => (
                    <Button variant='filledTonal' sx={styles.monitor} ref={setRef} {...getProps()} onClick={open}>
                      <Stack gap={1}>
                        <IconChevronDown size={18} />
                        <UserHeader size='md' pubkey={relayDiscoveryStore.selected} renderAvatar={false} />
                      </Stack>
                    </Button>
                  )}
                </Popover>
              </ContentProvider>
            </div>
          </Stack>
          <Divider />
          <Stack horizontal={false}>
            <Await promise={promise} fallback={<RelayDiscoveryRowLoading />}>
              {() => (
                <Observer>
                  {() => (
                    <table cellPadding={1}>
                      <RelayDiscoveryTableHeader />
                      <tbody>
                        {relayDiscoveryStore.list.map((event) => (
                          <RelayDiscoveryRow key={event.id} event={event} />
                        ))}
                      </tbody>
                    </table>
                  )}
                </Observer>
              )}
            </Await>
          </Stack>
        </Stack>
        <Stack sx={styles.footer} justify='center'>
          <Button variant='filledTonal' sx={styles.button} onClick={() => relayDiscoveryStore.paginate()}>
            Load More
          </Button>
        </Stack>
      </PaperContainer>
    </Stack>
  )
})

const styles = css.create({
  box: {},
  header: {
    padding: spacing.padding2,
    paddingLeft: spacing.padding3,
    paddingBlock: spacing.padding1,
  },
  footer: {
    padding: spacing.padding4,
  },
  monitor: {
    paddingLeft: spacing.padding1,
    paddingRight: spacing.padding2,
    paddingBlock: spacing['padding0.5'],
    borderRadius: shape.lg,
  },
  button: {
    height: 50,
  },
  menuItem: {
    paddingBlock: spacing['padding0.5'],
  },
})

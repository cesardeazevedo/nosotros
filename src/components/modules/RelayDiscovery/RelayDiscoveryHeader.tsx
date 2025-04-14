import { UserHeader } from '@/components/elements/User/UserHeader'
import { UserName } from '@/components/elements/User/UserName'
import { UserNIP05 } from '@/components/elements/User/UserNIP05'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { RelayDiscoveryTitle } from './RelayDiscoveryTitle'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryHeader = observer(function RelayDiscoveryHeader(props: Props) {
  const { module } = props
  return (
    <Stack gap={0.5} sx={styles.header} justify='space-between'>
      <RelayDiscoveryTitle module={module} />
      <Stack gap={0.5}>
        <SearchField placeholder='Search relays' sx={styles.search} onChange={(e) => module.setQuery(e.target.value)} />
        {module.selected && (
          <ContentProvider value={{ disablePopover: true, disableLink: true }}>
            <Popover
              contentRenderer={({ close }) => (
                <MenuList surface='surfaceContainerLowest'>
                  <Stack horizontal={false} gap={0.5}>
                    {module.listMonitors.map((monitor) => (
                      <MenuItem
                        key={monitor}
                        label={
                          <Stack gap={1}>
                            <UserName size='md' pubkey={monitor} />
                            <Text variant='title' size='sm'>
                              ({module.getTotal(monitor)})
                            </Text>
                          </Stack>
                        }
                        supportingText={<UserNIP05 pubkey={monitor} />}
                        onClick={() => {
                          module.select(monitor)
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
                    {module.selected && <UserHeader size='md' pubkey={module.selected} renderAvatar={false} />}
                  </Stack>
                </Button>
              )}
            </Popover>
          </ContentProvider>
        )}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding2,
    paddingLeft: spacing.padding3,
    paddingBlock: spacing.padding1,
  },
  monitor: {
    paddingLeft: spacing.padding1,
    paddingRight: spacing.padding2,
    //paddingBlock: spacing['padding0.5'],
    height: 40,
    paddingBlock: 0,
    borderRadius: shape.lg,
  },
  menuItem: {
    paddingBlock: spacing['padding0.5'],
  },
  search: {
    height: 40,
  },
})

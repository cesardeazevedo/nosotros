import { UserHeader } from '@/components/elements/User/UserHeader'
import { UserName } from '@/components/elements/User/UserName'
import { UserNIP05 } from '@/components/elements/User/UserNIP05'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryMonitorSelect = observer(function RelayDiscoveryMonitorSelect(props: Props) {
  const { module } = props
  return (
    <ContentProvider value={{ disablePopover: true, disableLink: true }}>
      <Popover
        placement='bottom-end'
        contentRenderer={({ close }) => (
          <MenuList outlined surface='surfaceContainerLow'>
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
  )
})

const styles = css.create({
  monitor: {
    paddingLeft: spacing.padding1,
    paddingRight: spacing.padding2,
    height: 40,
    paddingBlock: 0,
    borderRadius: shape.lg,
  },
})

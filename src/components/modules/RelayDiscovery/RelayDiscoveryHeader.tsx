import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { SearchField } from '@/components/ui/Search/Search'
import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconSettings, IconSettingsFilled } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { RelayDiscoveryMonitorSelect } from './RelayDiscoveryMonitorSelect'
import { RelayDiscoveryTitle } from './RelayDiscoveryTitle'

type Props = StackProps & {
  module: RelayDiscoveryModule
  collapsed?: boolean
  renderSearch?: boolean
  renderTitle?: boolean
  children?: ReactNode
}

const iconProps = {
  size: 20,
  strokeWidth: '1.5',
}

export const RelayDiscoveryHeader = observer(function RelayDiscoveryHeader(props: Props) {
  const { module, renderTitle = true, renderSearch = true, collapsed = false, children, ...rest } = props
  const isMobile = useMobile()
  const isCollapsed = isMobile || collapsed
  const [expanded, setExpanded] = useState(false)
  const filters = (
    <Stack gap={0.5} {...rest}>
      {renderSearch && (
        <SearchField placeholder='Search relays' sx={styles.search} onChange={(e) => module.setQuery(e.target.value)} />
      )}
      {module.selected && <RelayDiscoveryMonitorSelect module={module} />}
    </Stack>
  )
  return (
    <>
      <Stack gap={0.5} grow sx={styles.header} justify='space-between'>
        {renderTitle && <RelayDiscoveryTitle module={module} />}
        {!isCollapsed && filters}
        {isCollapsed && (
          <>
            <IconButton
              toggle
              icon={<IconSettings {...iconProps} />}
              selectedIcon={<IconSettingsFilled {...iconProps} />}
              onClick={() => setExpanded((prev) => !prev)}
            />
          </>
        )}
        {children}
      </Stack>
      {isCollapsed && (
        <Expandable expanded={expanded}>
          <Divider />
          <Stack grow sx={styles.settings} justify='space-between'>
            {filters}
          </Stack>
          <Divider />
        </Expandable>
      )}
    </>
  )
})

const styles = css.create({
  header: {
    width: '100%',
    padding: spacing.padding2,
    paddingLeft: spacing.padding3,
    paddingBlock: spacing.padding2,
  },
  monitor: {
    paddingLeft: spacing.padding1,
    paddingRight: spacing.padding2,
    height: 40,
    paddingBlock: 0,
    borderRadius: shape.lg,
  },
  search: {
    height: 40,
  },
  settings: {
    width: '100%',
    padding: spacing.padding1,
  },
})

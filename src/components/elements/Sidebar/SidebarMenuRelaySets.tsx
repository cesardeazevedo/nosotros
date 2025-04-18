import { ListRelaySetMenuItem } from '@/components/modules/Lists/RelaySets/RelaySetMenuItem'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useCurrentUser } from '@/hooks/useRootStore'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { SidebarSubheader } from './SidebarSubheader'

export const SidebarMenuRelaySets = observer(function SidebarMenuRelaySets() {
  const user = useCurrentUser()
  return (
    <Expandable
      initiallyExpanded={user?.relaySets.length !== 0}
      trigger={(triggerProps) => (
        <SidebarSubheader
          {...triggerProps}
          label={'My relay sets'}
          onCreateClick={() => dialogStore.setListForm(Kind.RelaySets)}
        />
      )}>
      <Stack gap={0.5} horizontal={false} sx={styles.content}>
        {user?.relaySets?.map((event) => <ListRelaySetMenuItem event={event} />)}
      </Stack>
    </Expandable>
  )
})

const styles = css.create({
  root: {
    marginLeft: spacing.margin2,
  },
  content: {
    overflowY: 'auto',
    maxHeight: 300,
    marginTop: spacing['margin0.5'],
  },
})

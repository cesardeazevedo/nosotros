import { FollowSetMenuItem } from '@/components/modules/Lists/FollowSets/FollowSetMenuItem'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useCurrentUser } from '@/hooks/useRootStore'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { SidebarSubheader } from './SidebarSubheader'

export const SidebarMenuFollowSets = observer(function SidebarMenuFollowSets() {
  const user = useCurrentUser()
  return (
    <Stack horizontal={false} gap={0.5}>
      <Expandable
        initiallyExpanded
        trigger={(triggerProps) => (
          <SidebarSubheader
            {...triggerProps}
            label='My follow sets'
            onCreateClick={() => dialogStore.setListForm(Kind.FollowSets)}
          />
        )}>
        <Stack gap={0.5} horizontal={false} sx={styles.content}>
          {user?.followSets?.map((event) => <FollowSetMenuItem renderAvatars event={event} />)}
        </Stack>
      </Expandable>
      <Expandable
        initiallyExpanded
        trigger={(triggerProps) => <SidebarSubheader {...triggerProps} label={"People's follow sets"} />}>
        <Stack gap={0.5} horizontal={false} sx={styles.content}>
          {user?.followsFollowSets?.map((event) => <FollowSetMenuItem event={event} />)}
        </Stack>
      </Expandable>
    </Stack>
  )
})

const styles = css.create({
  content: {
    overflowY: 'auto',
    maxHeight: 450,
    marginTop: spacing['margin0.5'],
  },
})

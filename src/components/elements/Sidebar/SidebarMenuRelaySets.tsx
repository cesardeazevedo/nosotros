import { Expandable } from '@/components/ui/Expandable/Expandable'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { useCurrentUser } from '@/hooks/useRootStore'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { Link } from '@tanstack/react-router'
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
          label={`Relay lists`}
          onCreateClick={() => dialogStore.setListForm(Kind.RelaySets)}
        />
      )}>
      <Stack gap={0.5} horizontal={false} sx={styles.content}>
        {user?.relaySets?.map((event) => {
          const title = event.getTag('title')
          const description = event.getTag('description')
          const relays = event.getTags('relay')
          const d = event.getTags('d')
          return (
            <Link
              key={event.id}
              to={'/feed'}
              search={{
                relaySets: [user.pubkey, d].join(':'),
                limit: 50,
                type: 'relaysets',
              }}>
              {({ isActive }) => (
                <MenuItem
                  sx={styles.root}
                  selected={isActive}
                  label={
                    <>
                      {title} <Text size='md'>({relays.length})</Text>
                    </>
                  }
                  supportingText={description}
                  onClick={() => {}}
                />
              )}
            </Link>
          )
        })}
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

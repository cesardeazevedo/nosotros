import { ContentProvider } from '@/components/providers/ContentProvider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { useCurrentUser } from '@/hooks/useRootStore'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { IconUsersGroupFilled } from '../Icons/IconUsersGroupFilled'
import { UsersAvatars } from '../User/UsersAvatars'
import { SidebarSubheader } from './SidebarSubheader'

export const SidebarMenuFollowSets = observer(function SidebarMenuFollowSets() {
  const user = useCurrentUser()
  return (
    <Expandable
      initiallyExpanded
      trigger={(triggerProps) => (
        <SidebarSubheader
          {...triggerProps}
          label='Follow lists'
          onCreateClick={() => dialogStore.setListForm(Kind.FollowSets)}
        />
      )}>
      <Stack gap={0.5} horizontal={false} sx={styles.content}>
        {user?.followSets?.map((x) => {
          const title = x.getTag('title')
          const pubkeys = x.getTags('p')
          const d = x.getTag('d')
          return (
            <Link
              key={x.id}
              to='/feed'
              search={{
                scope: 'followset',
                author: user.pubkey,
                d,
                type: 'followset',
                kind: [Kind.Text, Kind.Repost],
                limit: 50,
              }}>
              {({ isActive }) => (
                <MenuItem
                  selected={isActive}
                  sx={styles.menuItem}
                  leadingIcon={<IconUsersGroupFilled size={20} />}
                  trailingIcon={
                    <ContentProvider value={{ disableLink: true }}>
                      <UsersAvatars
                        borderColor={isActive ? 'surfaceContainer' : 'surfaceContainerLowest'}
                        pubkeys={pubkeys}
                        description={
                          <Text size='lg'>
                            {title} <Text sx={styles.gray}>({pubkeys.length})</Text>
                          </Text>
                        }
                      />
                    </ContentProvider>
                  }
                  label={
                    <>
                      {title}{' '}
                      <Text size='md' sx={styles.gray}>
                        ({pubkeys.length || 'empty'})
                      </Text>
                    </>
                  }
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
  content: {
    overflowY: 'auto',
    maxHeight: 300,
    marginTop: spacing['margin0.5'],
  },
  gray: {
    color: palette.onSurfaceVariant,
  },
  menuItem: {
    marginLeft: spacing.margin2,
  },
})

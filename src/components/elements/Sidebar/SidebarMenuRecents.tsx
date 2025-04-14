import { ContentProvider } from '@/components/providers/ContentProvider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { useRootContext, useRootStore } from '@/hooks/useRootStore'
import { subscribeUser } from '@/nostr/subscriptions/subscribeUser'
import { userStore } from '@/stores/users/users.store'
import { spacing } from '@/themes/spacing.stylex'
import { encodeSafe } from '@/utils/nip19'
import { IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { useObservable, useSubscription } from 'observable-hooks'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { SidebarSubheader } from './SidebarSubheader'

const RecentProfileRow = (props: { recent: { id: string } }) => {
  const { recent } = props
  const root = useRootStore()
  const pubkey = recent.id
  const user = userStore.get(pubkey)
  const nprofile = user?.nprofile || encodeSafe(() => nip19.nprofileEncode({ pubkey }))
  const ctx = useRootContext()
  const sub = useObservable(() => subscribeUser(pubkey, ctx))
  useSubscription(sub)
  return (
    <Link to={`/$nostr`} params={{ nostr: nprofile as string }}>
      {({ isActive }) => (
        <ContentProvider value={{ disableLink: true, disablePopover: true }}>
          <MenuItem
            size='sm'
            selected={isActive}
            leadingIcon={<UserAvatar size='xs' pubkey={pubkey} />}
            label={<UserName pubkey={pubkey} sx={styles.name} />}
            onClick={() => {}}
            sx={visibleOnHoverStyle.root}
            trailingIcon={
              <IconButton
                size='sm'
                sx={visibleOnHoverStyle.item}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  root.recents.remove(recent.id)
                }}>
                <IconX size={18} strokeWidth='1.5' />
              </IconButton>
            }
          />
        </ContentProvider>
      )}
    </Link>
  )
}

export const SidebarMenuRecents = observer(function SidebarMenuRecents() {
  const rootStore = useRootStore()
  return (
    rootStore.recents.list.length > 0 && (
      <div>
        <Expandable initiallyExpanded trigger={(triggerProps) => <SidebarSubheader {...triggerProps} label='Recent' />}>
          <Stack horizontal={false} sx={styles.content}>
            {rootStore.recents.list.map((recent) => {
              if (recent.type === 'profile') {
                return <RecentProfileRow key={recent.id + recent.type} recent={recent} />
              }
              return null
            })}
          </Stack>
        </Expandable>
      </div>
    )
  )
})

const styles = css.create({
  content: {
    maxHeight: 218,
    overflowY: 'auto',
    marginTop: spacing['padding0.5'],
  },
  name: {
    maxWidth: 200,
  },
})

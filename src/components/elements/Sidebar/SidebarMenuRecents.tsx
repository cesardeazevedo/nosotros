import { recentsAtom, removeRecentAtom } from '@/atoms/recent.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { useUserState } from '@/hooks/state/useUser'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { spacing } from '@/themes/spacing.stylex'
import { encodeSafe } from '@/utils/nip19'
import { IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { nip19 } from 'nostr-tools'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { SidebarSubheader } from './SidebarSubheader'

const RecentProfileRow = (props: { recent: { id: string } }) => {
  const { recent } = props
  const pubkey = recent.id
  const user = useUserState(pubkey)
  const remove = useSetAtom(removeRecentAtom)
  const nprofile = user?.nprofile || encodeSafe(() => nip19.nprofileEncode({ pubkey }))
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
                  remove(recent.id)
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

export const SidebarMenuRecents = memo(function SidebarMenuRecents() {
  const settings = useSettings()
  const toggle = useToggleSettings()
  const recents = useAtomValue(recentsAtom)
  return (
    recents.length > 0 && (
      <div>
        <Expandable
          initiallyExpanded={settings.recentsCollapsed}
          onChange={() => toggle('recentsCollapsed')}
          trigger={(triggerProps) => <SidebarSubheader {...triggerProps} label='Recent' />}>
          <Stack horizontal={false} sx={styles.content}>
            {recents.map((recent) => {
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
    maxWidth: 190,
  },
})

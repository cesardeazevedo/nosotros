import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { IconServerBolt, IconSettings, IconUser } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { css } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { SidebarMenuLogout } from '../Sidebar/SidebarMenuLogout'

type Props = {
  onAction?: () => void
}

export const ProfilePopoverMenu = (props: Props) => {
  const pubkey = useCurrentPubkey()
  const iconProps = {
    size: 24,
    strokeWidth: '1.8',
  }
  return (
    <Stack horizontal={false} gap={1} sx={styles.root}>
      {pubkey && (
        <LinkProfile pubkey={pubkey} underline={false}>
          <MenuItem
            size='sm'
            onClick={() => props.onAction?.()}
            leadingIcon={<IconUser {...iconProps} />}
            label='Profile'
          />
        </LinkProfile>
      )}
      <Link to='/relays'>
        <MenuItem size='sm' leadingIcon={<IconServerBolt {...iconProps} />} onClick={props.onAction} label='Relays' />
      </Link>
      <Link to='/settings'>
        <MenuItem size='sm' leadingIcon={<IconSettings {...iconProps} />} onClick={props.onAction} label='Settings' />
      </Link>
      <Divider />
      <SidebarMenuLogout size='sm' />
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
})

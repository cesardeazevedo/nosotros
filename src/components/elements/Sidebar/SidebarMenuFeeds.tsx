import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useAuth'
import { palette } from '@/themes/palette.stylex'
import { Link } from '@tanstack/react-router'
import { memo, useContext } from 'react'
import { css } from 'react-strict-dom'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { SidebarContext } from './SidebarContext'

export const SidebarMenuFeeds = memo(function SidebarMenuFeeds() {
  const context = useContext(SidebarContext)
  const handleClickHome = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0 })
    })
  }

  const user = useCurrentUser()

  const iconProps = {
    size: 26,
    strokeWidth: '1.8',
  }

  return (
    <Link tabIndex={-1} to='/' onClick={handleClickHome}>
      {({ isActive }) => (
        <MenuItem
          selected={isActive}
          onClick={() => context.setPane(false)}
          leadingIcon={isActive ? <IconHomeFilled /> : <IconHome {...iconProps} />}
          label={
            <>
              Following {user?.totalFollows ? <Text size='md' sx={styles.gray}>{`(${user.totalFollows})`}</Text> : ''}
            </>
          }
        />
      )}
    </Link>
  )
})

const styles = css.create({
  gray: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
})

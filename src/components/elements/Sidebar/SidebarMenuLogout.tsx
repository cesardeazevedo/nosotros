import type { Props as MenuItemProps } from '@/components/ui/MenuItem/MenuItem'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { useLogout } from '@/hooks/useAuth'
import { IconLogout } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useContext } from 'react'
import { SidebarContext } from './SidebarContext'

type Props = {
  size?: MenuItemProps['size']
  onClick?: () => void
}

export const SidebarMenuLogout = (props: Props) => {
  const { size, onClick } = props
  const logout = useLogout()
  const context = useContext(SidebarContext)
  const navigate = useNavigate()
  return (
    <MenuItem
      size={size}
      leadingIcon={<IconLogout strokeWidth='1.8' />}
      label='Log out'
      onClick={() => {
        context.setPane(false)
        logout()
        onClick?.()
        navigate({ to: '/' })
      }}
    />
  )
}

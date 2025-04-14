import { DrawerSwipeable } from '@/components/ui/Drawer/DrawerSwipeable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import type { SxProps } from '@/components/ui/types'
import { IconMenu2 } from '@tabler/icons-react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'

type Props = {
  sx?: SxProps
}

export const SidebarDrawer = (props: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton sx={props.sx} onClick={() => setOpen(true)} icon={<IconMenu2 />} />
      <DrawerSwipeable anchor='left' opened={open} onClose={() => setOpen(false)}>
        <Sidebar />
      </DrawerSwipeable>
    </>
  )
}

import { DrawerSwipeable } from '@/components/ui/Drawer/DrawerSwipeable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import type { SxProps } from '@/components/ui/types'
import { IconMenu2 } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { Sidebar } from './Sidebar'
import type { Panes } from './SidebarContext'
import { SidebarContext } from './SidebarContext'

type Props = {
  sx?: SxProps
}

export const SidebarDrawer = (props: Props) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const setPane = (pane: Panes) => {
    navigate({ to: pane as string })
    setOpen(false)
  }
  return (
    <>
      <IconButton sx={props.sx} onClick={() => setOpen(true)} icon={<IconMenu2 />} />
      <DrawerSwipeable anchor='left' opened={open} onClose={() => setOpen(false)}>
        <SidebarContext.Provider value={{ pane: false, setPane, renderCollapsedButton: false }}>
          <Sidebar sx={styles.sidebar} />
        </SidebarContext.Provider>
      </DrawerSwipeable>
    </>
  )
}

const styles = css.create({
  sidebar: {
    position: 'relative',
  },
})

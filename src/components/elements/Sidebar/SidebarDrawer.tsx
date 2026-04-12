import { DrawerSwipeable } from '@/components/ui/Drawer/DrawerSwipeable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import type { SxProps } from '@/components/ui/types'
import { spacing } from '@/themes/spacing.stylex'
import { IconMenu2 } from '@tabler/icons-react'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { Sidebar } from './Sidebar'
import { SidebarContext } from './SidebarContext'

type Props = {
  sx?: SxProps
}

export const SidebarDrawer = (props: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton sx={props.sx} onClick={() => setOpen(true)} icon={<IconMenu2 />} />
      <DrawerSwipeable anchor='left' opened={open} onClose={() => setOpen(false)}>
        <SidebarContext.Provider
          value={{ renderCollapsedButton: false, toggleCollapsed: () => { } }}>
          <Sidebar sx={styles.sidebar} />
        </SidebarContext.Provider>
      </DrawerSwipeable>
    </>
  )
}

const styles = css.create({
  sidebar: {
    position: 'relative',
    paddingBottom: spacing.padding6,
  },
})

import { Fab } from '@/components/ui/Fab/Fab'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { IconPencil } from '../Icons/IconPencil'
import { ProfilePopover } from '../Navigation/ProfilePopover'

export const DeckSidebar = observer(function DeckSidebar() {
  return (
    <Stack horizontal={false} justify='space-between' align='center' sx={styles.root}>
      <Tooltip cursor='arrow' enterDelay={0} text='Create note' placement='right'>
        <Link to='.' search={{ compose: true }}>
          <Fab variant='primary'>
            <IconPencil />
          </Fab>
        </Link>
      </Tooltip>
      <Stack horizontal={false} gap={4}>
        {/* <Tooltip cursor='arrow' enterDelay={0} text='Add column' placement='right'> */}
        {/*   <IconButton icon={<IconSquareRoundedPlus size={28} strokeWidth='1.5' />} /> */}
        {/* </Tooltip> */}
        <ProfilePopover />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'absolute',
    backgroundColor: palette.surfaceContainerLowest,
    paddingTop: spacing.padding10,
    paddingBottom: spacing.padding4,
    borderRightWidth: 1,
    borderRightColor: palette.outlineVariant,
    left: 0,
    top: 0,
    bottom: 0,
    width: 74,
    zIndex: 100,
  },
})

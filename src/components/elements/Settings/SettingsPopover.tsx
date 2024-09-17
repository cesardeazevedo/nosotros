import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { spacing } from '@/themes/spacing.stylex'
import { IconSettings } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'
import ThemeButton from '../Buttons/ThemeButton'
import SettingsNostr from './SettingsNostr'

function SettingsPopover() {
  const [open, setOpen] = useState(false)

  const handleClick = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <PopoverBase
        opened={open}
        onClose={handleClose}
        placement='bottom-end'
        contentRenderer={() => (
          <Paper elevation={2} surface='surfaceContainerLowest' sx={styles.root}>
            <Stack justify='space-between' sx={styles.header}>
              <Text variant='label' size='lg'>
                Settings
              </Text>
              <ThemeButton />
            </Stack>
            <Divider />
            <SettingsNostr />
          </Paper>
        )}>
        {({ getProps, setRef }) => (
          <Tooltip cursor='arrow' text='Settings'>
            <IconButton {...getProps()} ref={setRef} onClick={handleClick} icon={<IconSettings strokeWidth='1.4' />} />
          </Tooltip>
        )}
      </PopoverBase>
    </>
  )
}

const styles = css.create({
  root: {
    width: 310,
  },
  header: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  footer: {
    padding: spacing.padding1,
  },
})

export default SettingsPopover

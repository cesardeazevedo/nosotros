import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconBrush,
  IconChevronDown,
  IconChevronRight,
  IconHeart,
  IconSettings,
  IconTopologyStar,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'
import { SettingsContent } from './SettingsContent'
import { SettingsNetwork } from './SettingsNetwork'
import { SettingsTheme } from './SettingsTheme'

export const SettingsPopover = () => {
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
          <Paper elevation={2} surface='surfaceContainerLow' sx={styles.root}>
            <Expandable
              initiallyExpanded
              trigger={({ expand, expanded }) => (
                <Stack gap={1} sx={styles.header} onClick={() => expand(!expanded)}>
                  <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
                  <IconTopologyStar strokeWidth='1.5' />
                  <Text variant='label' size='lg'>
                    Network Settings
                  </Text>
                </Stack>
              )}>
              <Stack gap={1} horizontal={false} sx={styles.content}>
                <SettingsNetwork />
              </Stack>
            </Expandable>

            <Divider />
            <Expandable
              initiallyExpanded={false}
              trigger={({ expand, expanded }) => (
                <Stack gap={1} sx={styles.header} onClick={() => expand(!expanded)}>
                  <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
                  <IconHeart strokeWidth='1.8' />
                  <Text variant='label' size='lg'>
                    Content Settings
                  </Text>
                </Stack>
              )}>
              <Stack gap={1} horizontal={false} sx={styles.content}>
                <Text sx={styles.description}>
                  Reactions and zaps are loaded as you scroll through the feed, you can disable them to save bandwidth.
                </Text>
                <SettingsContent />
              </Stack>
            </Expandable>
            <Divider />
            <Expandable
              initiallyExpanded={false}
              trigger={({ expand, expanded }) => (
                <Stack gap={1} sx={styles.header} onClick={() => expand(!expanded)}>
                  <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
                  <IconBrush strokeWidth='1.8' />
                  <Text variant='label' size='lg'>
                    UI Settings
                  </Text>
                </Stack>
              )}>
              <Stack gap={2} horizontal={false} sx={styles.content} align='center' justify='center'>
                <SettingsTheme />
              </Stack>
            </Expandable>
            <Divider />
            <Stack sx={styles.footer}>
              <Link to='/settings'>
                <Button variant='filledTonal'>See full settings</Button>
              </Link>
            </Stack>
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
  content: {
    paddingBlock: spacing.padding1,
  },
  description: {
    paddingInline: spacing.padding2,
  },
  footer: {
    padding: spacing.padding1,
  },
})

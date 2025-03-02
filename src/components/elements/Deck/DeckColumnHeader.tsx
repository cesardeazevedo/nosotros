import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useRootStore } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconSettings, IconSettingsFilled } from '@tabler/icons-react'
import React, { useCallback } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  id: string
  settings?: React.ReactNode
  settingsIcon?: (props: { expand: (value: boolean) => void; expanded?: boolean }) => React.ReactNode
  children: React.ReactNode
  renderSettings?: boolean
  onDelete?: () => void
}

export const DeckColumnHeader = (props: Props) => {
  const { settings, settingsIcon, renderSettings = true, onDelete } = props
  const root = useRootStore()

  const handleDelete = useCallback(() => {
    root.decks.selected.delete(props.id)
  }, [props.id])

  return (
    <Stack horizontal={false}>
      <Expandable
        trigger={({ expand, expanded }) => (
          <Stack align='center' justify='space-between' sx={styles.header}>
            <Stack gap={1}>
              {/* <Tooltip cursor='arrow' text='Drag feed to a new position (coming soon)'> */}
              {/*   <IconButton size='sm' icon={<IconGripVertical size={18} />} /> */}
              {/* </Tooltip> */}
              {props.children}
            </Stack>
            {renderSettings &&
              (settingsIcon?.({ expand, expanded }) || (
                <Tooltip cursor='arrow' text='Feed Settings'>
                  <IconButton
                    toggle
                    selected={expanded}
                    size='sm'
                    variant='standard'
                    onClick={() => expand(!expanded)}
                    icon={<IconSettings size={20} strokeWidth='1.5' />}
                    selectedIcon={<IconSettingsFilled size={20} strokeWidth='1.0' />}
                  />
                </Tooltip>
              ))}
          </Stack>
        )}>
        <>
          {settings}
          <Divider />
          <Stack sx={styles.footer} justify={props.settings ? 'space-between' : 'flex-end'} gap={1}>
            {renderSettings && (
              <Button variant='danger' onClick={onDelete || handleDelete}>
                Delete Column
              </Button>
            )}
          </Stack>
        </>
      </Expandable>
      <Divider />
    </Stack>
  )
}

const styles = css.create({
  header: {
    height: 64,
    padding: spacing.padding2,
  },
  footer: {
    padding: spacing.padding1,
  },
})

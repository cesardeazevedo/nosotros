import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useRootStore } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconSettings, IconSettingsFilled } from '@tabler/icons-react'
import React, { useCallback } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  id: string
  name: string
  settings?: React.ReactElement
  children: React.ReactElement | React.ReactElement[]
  renderSettings?: boolean
  renderDelete?: boolean
  onDelete?: () => void
}

export const DeckColumnHeader = (props: Props) => {
  const { renderDelete = true, renderSettings = true, onDelete } = props
  const root = useRootStore()

  const handleDelete = useCallback(() => {
    root.decks.selected.delete(props.id)
  }, [props.id])

  return (
    <>
      <Paper shape='none' surface='surfaceContainerLowest' sx={styles.paper}>
        <Expandable
          trigger={({ expand, expanded }) => (
            <Stack align='center' justify='space-between' sx={styles.header}>
              <Stack gap={1}>
                {/* <Tooltip cursor='arrow' text='Drag feed to a new position (coming soon)'> */}
                {/*   <IconButton size='sm' icon={<IconGripVertical size={18} />} /> */}
                {/* </Tooltip> */}
                {props.children}
              </Stack>
              {renderSettings && (
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
              )}
            </Stack>
          )}>
          <>
            {props.settings}
            {(props.settings || renderDelete) && (
              <>
                <Divider />
                <Stack sx={styles.footer} justify={props.settings ? 'space-between' : 'flex-end'} gap={1}>
                  {renderSettings && (
                    <Button variant='danger' onClick={onDelete || handleDelete}>
                      Delete
                    </Button>
                  )}
                  {props.settings && (
                    <Stack gap={0.5}>
                      <Button onClick={() => {}}>Reset</Button>
                      <Button variant='filled'>Apply filters</Button>
                    </Stack>
                  )}
                </Stack>
              </>
            )}
          </>
        </Expandable>
        <Divider />
      </Paper>
    </>
  )
}

const styles = css.create({
  paper: {
    position: 'relative',
    flexGrow: 0,
  },
  header: {
    height: 60,
    padding: spacing.padding2,
  },
  footer: {
    padding: spacing.padding1,
  },
})

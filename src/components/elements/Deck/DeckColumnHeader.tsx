import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { spacing } from '@/themes/spacing.stylex'
import { IconSettings, IconSettingsFilled } from '@tabler/icons-react'
import React, { useCallback } from 'react'
import { css } from 'react-strict-dom'
import { deckStore } from 'stores/ui/deck.store'

type Props = {
  id: string
  name: string
  settings?: React.ReactElement
  children: React.ReactElement | React.ReactElement[]
  renderSettings?: boolean
  renderDelete?: boolean
}

function DeckColumnHeader(props: Props) {
  const { renderDelete = true, renderSettings = true } = props

  const handleDelete = useCallback(() => {
    deckStore.removeColumn(props.id)
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
                <Stack sx={styles.footer} justify={props.settings ? 'space-between' : 'flex-end'} gap={1}>
                  {renderSettings && (
                    <Button variant='danger' onClick={handleDelete}>
                      Delete
                    </Button>
                  )}
                  {props.settings && (
                    <div>
                      <Button>Cancel</Button>
                      <Button variant='filled'>Apply filters</Button>
                    </div>
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

export default DeckColumnHeader

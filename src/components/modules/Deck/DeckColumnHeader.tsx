import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useRootStore } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconSettings, IconSettingsFilled, IconTrash } from '@tabler/icons-react'
import React from 'react'
import { css } from 'react-strict-dom'

export type Props = {
  id: string
  children?: React.ReactNode
  trailing?: (props: { expand: (value: boolean) => void; expanded?: boolean }) => React.ReactNode
  icon?: React.ReactNode
  leading?: React.ReactNode
  label?: React.ReactNode
  onDelete?: () => void
}

export const DeckColumnHeader = (props: Props) => {
  const root = useRootStore()
  const { label, children, leading, icon: leadingIcon, trailing } = props

  const handleDelete = () => {
    root.decks.selected.delete(props.id)
  }

  const onDelete = props.onDelete || handleDelete

  return (
    <Stack horizontal={false}>
      <Expandable
        trigger={({ expand, expanded }) => (
          <Stack align='center' justify='space-between' sx={[styles.header, visibleOnHoverStyle.root]}>
            <Stack gap={1}>
              {/* <Tooltip cursor='arrow' text='Drag feed to a new position (coming soon)'> */}
              {/*   <IconButton size='sm' icon={<IconGripVertical size={18} />} /> */}
              {/* </Tooltip> */}
              {leading}
              {label && (
                <Stack gap={2}>
                  {leadingIcon}
                  <Text variant='title' size='md'>
                    {label}
                  </Text>
                </Stack>
              )}
            </Stack>
            <Stack gap={0.5}>
              <IconButton sx={visibleOnHoverStyle.item} onClick={onDelete}>
                <IconTrash size={22} strokeWidth='1.5' color={colors.red8} />
              </IconButton>
              {trailing?.({ expand, expanded }) ||
                (children && (
                  <Tooltip cursor='arrow' text='Feed Settings'>
                    <IconButton
                      toggle
                      selected={expanded}
                      //size='sm'
                      variant='standard'
                      onClick={() => expand(!expanded)}
                      icon={<IconSettings size={22} strokeWidth='1.5' />}
                      selectedIcon={<IconSettingsFilled size={22} strokeWidth='1.0' />}
                    />
                  </Tooltip>
                ))}
              {/* {renderSettings && ( */}
              {/*   <Button variant='filledTonal' onClick={() => expand(!expanded)}> */}
              {/*     <Stack gap={0.5}> */}
              {/*       <IconExpandable upwards strokeWidth='2.5' expanded={expanded} /> */}
              {/*       Feed Settings */}
              {/*     </Stack> */}
              {/*   </Button> */}
              {/* )} */}
              {/* {renderSettings && */}
              {/*   (settingsIcon?.({ expand, expanded }) || ( */}
              {/*     <Tooltip cursor='arrow' text='Feed Settings'> */}
              {/*       <IconButton */}
              {/*         toggle */}
              {/*         selected={expanded} */}
              {/*         size='sm' */}
              {/*         variant='standard' */}
              {/*         onClick={() => expand(!expanded)} */}
              {/*         icon={<IconSettings size={20} strokeWidth='1.5' />} */}
              {/*         selectedIcon={<IconSettingsFilled size={20} strokeWidth='1.0' />} */}
              {/*       /> */}
              {/*     </Tooltip> */}
              {/*   ))} */}
            </Stack>
          </Stack>
        )}>
        <>
          {children}
          <Divider />
          <Stack sx={styles.footer} justify={'space-between'} gap={1}>
            {children && leading && (
              <Button variant='danger' onClick={onDelete}>
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

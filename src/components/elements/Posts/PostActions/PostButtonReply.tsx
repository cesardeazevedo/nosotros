import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useEventReplies } from '@/hooks/query/useReplies'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconMessageCircle, IconMessageCircle2Filled } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import type { ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  selected?: boolean
  onClick?: () => void
}

export const ButtonReply = memo(function ButtonReply(props: Props & ContainerProps) {
  const { selected = false, onClick, ...rest } = props
  const { dense } = useContentContext()
  const { event } = useNoteContext()
  const { total: queryTotal } = useEventReplies(event)
  const count = typeof rest.value === 'number' ? rest.value : queryTotal

  const button = (
    <IconButton
      toggle={selected}
      selected={selected}
      size={dense ? 'sm' : 'md'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick?.()
      }}
      icon={
        <IconMessageCircle
          size={dense ? iconProps.size$dense : iconProps.size}
          strokeWidth={iconProps.strokeWidth}
        />
      }
      selectedIcon={
        <IconMessageCircle2Filled
          size={dense ? iconProps.size$dense : iconProps.size}
          strokeWidth={iconProps.strokeWidth}
        />
      }
    />
  )

  if (!count) return button

  return (
    <Stack sx={styles.root} gap={0.5}>
      {button}
      {count}
    </Stack>
  )
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    fontSize: typeScale.bodySize$lg,
    marginRight: spacing.margin1,
    fontWeight: 500,
  },
})

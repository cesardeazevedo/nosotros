import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlus } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { IconExpandable } from '../Icons/IconExpandable'

type Props = {
  label: string
  selected?: boolean
  icon?: ReactNode
  onCreateClick?: () => void
  expanded?: boolean | undefined
  expand?: (value: boolean) => void
  sx?: SxProps
}

const iconProps = {
  size: 18,
  strokeWidth: '2.5',
}

export const SidebarSubheader = (props: Props) => {
  const { label, expanded, expand, selected, sx, onCreateClick } = props
  const isExpandable = expanded !== undefined
  return (
    <MenuItem
      size='sm'
      selected={selected}
      sx={[styles.root, visibleOnHoverStyle.root, sx]}
      onClick={isExpandable ? () => expand?.(!expanded) : undefined}
      label={
        <Text size='md' sx={styles.label}>
          {label}
        </Text>
      }
      leadingIcon={isExpandable && <IconExpandable {...iconProps} expanded={expanded} />}
      trailingIcon={
        onCreateClick && (
          <IconButton
            size='sm'
            sx={visibleOnHoverStyle.item}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCreateClick()
            }}>
            <IconPlus {...iconProps} />
          </IconButton>
        )
      }
    />
  )
}

const styles = css.create({
  root: {
    gap: spacing.padding1,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding2,
  },
  label: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
})

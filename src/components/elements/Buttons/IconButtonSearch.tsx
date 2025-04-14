import { IconButton } from '@/components/ui/IconButton/IconButton'
import type { IPopoverBaseProps } from '@/components/ui/Popover/PopoverBase.types'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { IconSearch } from '@tabler/icons-react'

type Props = {
  placement?: IPopoverBaseProps['placement']
  size?: number
  strokeWidth?: string
  sx?: SxProps
}

export const IconButtonSearch = (props: Props) => {
  const { size = 24, strokeWidth = '2', sx, placement = 'bottom' } = props
  return (
    <Tooltip placement={placement} text='Search'>
      <IconButton sx={sx} onClick={() => dialogStore.toggleSearch()}>
        <IconSearch size={size} strokeWidth={strokeWidth} />
      </IconButton>
    </Tooltip>
  )
}

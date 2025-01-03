import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import type { IPopoverBaseProps } from '@/components/ui/Popover/PopoverBase.types'
import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'
import type { Props as SearchUserProps, SearchUsersRef } from './SearchUsers'
import { SearchUsers } from './SearchUsers'

export type Props = {
  clientRect?: (() => DOMRect | null) | null
  children?: IPopoverBaseProps['children']
} & SearchUserProps &
  Omit<IPopoverBaseProps, 'contentRenderer'>

export type SearchType = 'following' | 'nip50'

export const SearchUsersPopover = observer(
  forwardRef<SearchUsersRef, Props>(function SearchUsersPopover(props, ref) {
    const { query = '', limit = 10, onSelect, ...rest } = props
    const rect = props.clientRect?.()

    return (
      <PopoverBase
        {...rest}
        clientPoint={rect ? { x: rect.x, y: rect.y + rect.height } : undefined}
        placement='bottom-start'
        role='tooltip'
        contentRenderer={() => <SearchUsers dense ref={ref} query={query} limit={limit} onSelect={onSelect} />}>
        {rest.children}
      </PopoverBase>
    )
  }),
)

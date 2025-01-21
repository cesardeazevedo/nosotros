import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import type { IPopoverBaseProps } from '@/components/ui/Popover/PopoverBase.types'
import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback } from 'react'
import type { Props as SearchUserProps, SearchUsersRef } from './SearchUsers'
import { SearchUsers } from './SearchUsers'
import type { Editor } from '@tiptap/core'

export type Props = {
  clientRect?: (() => DOMRect | null) | null
  children?: IPopoverBaseProps['children']
  editor?: Editor
} & SearchUserProps &
  Omit<IPopoverBaseProps, 'contentRenderer'>

export type SearchType = 'following' | 'nip50'

export const SearchUsersPopover = observer(
  forwardRef<SearchUsersRef, Props>(function SearchUsersPopover(props, ref) {
    const { query = '', limit = 10, onSelect, ...rest } = props
    const rect = props.clientRect?.()
    const handleClick = useCallback(() => {
      props.editor?.commands.focus()
    }, [])

    return (
      <PopoverBase
        {...rest}
        clientPoint={rect ? { x: rect.x, y: rect.y + rect.height } : undefined}
        placement='bottom-start'
        role='tooltip'
        contentRenderer={() => (
          <SearchUsers onClick={handleClick} dense ref={ref} query={query} limit={limit} onSelect={onSelect} />
        )}>
        {rest.children}
      </PopoverBase>
    )
  }),
)

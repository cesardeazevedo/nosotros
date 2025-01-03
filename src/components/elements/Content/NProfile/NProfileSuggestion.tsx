import type { SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useState } from 'react'
import type { Props as SearchUsersPopoverProps } from '../../Search/SearchUsersPopover'
import { SearchUsersPopover } from '../../Search/SearchUsersPopover'
import type { SearchUsersRef } from '../../Search/SearchUsers'

export type Props = SuggestionProps & SearchUsersPopoverProps & {}

export const NProfileSuggestion = forwardRef<SearchUsersRef, Props>((props, ref) => {
  const [open, setOpen] = useState(true)
  return (
    <SearchUsersPopover {...props} opened={open} onSelect={props.command} onClose={() => setOpen(false)} ref={ref} />
  )
})

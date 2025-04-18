import type { OnKeyDownRef } from '@/components/modules/Search/SearchContent'
import { SearchContent } from '@/components/modules/Search/SearchContent'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import type { SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useState } from 'react'

export type Props = SuggestionProps & {
  limit?: number
  children: React.ReactNode
}

export const NProfileSuggestion = forwardRef<OnKeyDownRef, Props>((props, ref) => {
  const { query = '', limit = 10, clientRect } = props
  const [open, setOpen] = useState(true)
  const rect = clientRect?.()

  return (
    <PopoverBase
      opened={open}
      onClose={() => setOpen(false)}
      clientPoint={rect ? { x: rect.x, y: rect.y + rect.height } : undefined}
      placement='bottom-start'
      role='tooltip'
      contentRenderer={() => (
        <Paper outlined elevation={3} surface='surfaceContainerLowest'>
          <SearchContent dense ref={ref} query={query} limit={limit} onSelect={props.command} />
        </Paper>
      )}>
      {props.children}
    </PopoverBase>
  )
})

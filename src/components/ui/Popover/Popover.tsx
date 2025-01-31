import { memo, useCallback, useState } from 'react'
import { PopoverBase } from './PopoverBase'
import type { IPopoverBaseProps, IPopoverBaseTriggerRendererProps } from './PopoverBase.types'
import { PopoverHoverRender } from './PopoverHoverRender'

type Props = Omit<IPopoverBaseProps, 'children'> & {
  children: (props: IPopoverBaseTriggerRendererProps) => React.ReactNode
}

export const Popover = memo(function Popover(props: Props) {
  const [open, setOpen] = useState(false)
  const { children, ...rest } = props

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <PopoverHoverRender
      content={children({
        opened: open,
        setRef: null,
        getProps: () => ({}),
        close: handleClose,
        open: handleOpen,
      } as IPopoverBaseTriggerRendererProps)}>
      <PopoverBase {...rest} opened={open} onClose={handleClose}>
        {(props) => (
          <>{typeof children === 'function' ? children({ ...props, open: () => setOpen(true) }) : children}</>
        )}
      </PopoverBase>
    </PopoverHoverRender>
  )
})

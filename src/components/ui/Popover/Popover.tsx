import { memo, useCallback, useState } from 'react'
import { PopoverBase } from './PopoverBase'
import type { IPopoverBaseProps, IPopoverBaseTriggerRendererProps } from './PopoverBase.types'

type Props = Omit<IPopoverBaseProps, 'children'> & {
  children: (props: IPopoverBaseTriggerRendererProps) => React.ReactNode
}

export const Popover = memo(function Popover(props: Props) {
  const [open, setOpen] = useState(false)
  const { children, ...rest } = props

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <PopoverBase {...rest} opened={open} onClose={handleClose} closeEvents={{ clickOutside: true }}>
      {(props) => (
        <>{typeof children === 'function' ? children({ ...props, open: handleOpen, close: handleClose }) : children}</>
      )}
    </PopoverBase>
  )
})

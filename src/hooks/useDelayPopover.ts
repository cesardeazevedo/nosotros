import type { PopupState } from 'material-ui-popup-state/hooks'
import { useEffect, useState } from 'react'

export function useDelayPopover(popupState: PopupState, delay = 400) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Delay popup on enter
    if (popupState.isOpen && !open) {
      setTimeout(() => {
        setOpen(popupState.isOpen)
      }, delay)
    } else {
      setOpen(popupState.isOpen)
    }
  }, [delay, popupState.isOpen, open])

  return open
}

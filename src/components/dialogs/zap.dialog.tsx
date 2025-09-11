import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { ZapRequest } from '../elements/Zaps/ZapRequest'

export const ZapDialog = () => {
  const nevent = useMatch({
    from: '__root__',
    select: (x) => x.search.zap,
  })
  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ zap, ...rest }) => rest })
  }, [])

  const event = useEventFromNIP19(nevent || '')

  return (
    <DialogSheet maxWidth='xs' open={!!nevent} onClose={handleClose}>
      {event.data && <ZapRequest event={event.data} />}
    </DialogSheet>
  )
}

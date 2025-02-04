import { decodeNIP19 } from '@/utils/nip19'
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

  const decoded = decodeNIP19(nevent || '')
  const event = decoded?.type === 'nevent' ? decoded.data : null

  return (
    <DialogSheet maxWidth='xs' open={!!nevent} onClose={handleClose}>
      {event && <ZapRequest {...event} />}
    </DialogSheet>
  )
}

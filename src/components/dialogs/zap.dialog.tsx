import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { decodeNIP19 } from '@/utils/nip19'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { ZapRequest } from '../elements/Zaps/ZapRequest'

export const ZapDialog = () => {
  const nip19 = useMatch({
    from: '__root__',
    select: (x) => x.search.zap,
  })
  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ zap, ...rest }) => rest })
  }, [])

  const decoded = decodeNIP19(nip19)
  const event = useEventFromNIP19(nip19 || '')

  return (
    <DialogSheet maxWidth='xs' open={!!nip19} onClose={handleClose}>
      {decoded?.type === 'nevent' ? (
        <>{event.data && <ZapRequest toEvent={event.data} />}</>
      ) : (
        decoded?.type === 'nprofile' && <ZapRequest toPubkey={decoded.data.pubkey} />
      )}
    </DialogSheet>
  )
}

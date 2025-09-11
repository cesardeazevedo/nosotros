import { decodeNIP19 } from '@/utils/nip19'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { ZapRequestInvoice } from '../elements/Zaps/ZapRequestInvoice'

export const ZapRequestInvoiceDialog = () => {
  const invoice = useMatch({
    from: '__root__',
    select: (x) => x.search?.invoice,
  })
  const nevent = useMatch({
    from: '__root__',
    select: (x) => x.search?.n,
  })

  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ invoice, n, ...rest } = {}) => rest })
  }, [])

  const decoded = decodeNIP19(nevent || '')
  const data = decoded?.type === 'nevent' ? decoded?.data : undefined

  return (
    <DialogSheet maxWidth='xs' open={!!invoice && !!nevent} onClose={handleClose}>
      {invoice && data && <ZapRequestInvoice event={data} invoice={invoice} />}
    </DialogSheet>
  )
}

import { decodeNIP19 } from '@/utils/nip19'
import { useMatch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { ZapRequestInvoice } from '../elements/Zaps/ZapRequestInvoice'

export const ZapRequestInvoiceDialog = () => {
  const invoice = useMatch({
    from: '__root__',
    // @ts-ignore
    select: (x) => x.search.invoice,
  })
  const nevent = useMatch({
    from: '__root__',
    // @ts-ignore
    select: (x) => x.search.nevent,
  })

  const handleClose = useCallback(() => {
    // @ts-ignore
    router.navigate({ search: {} })
  }, [])

  const decoded = decodeNIP19(nevent)
  const data = decoded?.type === 'nevent' ? decoded?.data : undefined

  return (
    <DialogSheet maxWidth='xs' open={!!invoice && !!nevent} onClose={handleClose}>
      {invoice && data && <ZapRequestInvoice event={data} invoice={invoice} />}
    </DialogSheet>
  )
}

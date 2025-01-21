import { useParams, useRouter } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { PostRepliesDialog } from 'components/elements/Posts/PostReplies/PostRepliesDialog'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect } from 'react'
import { dialogStore } from 'stores/ui/dialogs.store'
import { decodeNIP19 } from 'utils/nip19'

export const RepliesDialog = observer(function RepliesDialog() {
  const router = useRouter()
  const goBack = useGoBack()
  const params = useParams({ strict: false })

  useEffect(() => {
    const decoded = params.nevent ? decodeNIP19(params.nevent) : undefined
    const id = decoded?.type === 'nevent' ? decoded.data.id : undefined
    if (router.latestLocation.pathname.includes('/replies')) {
      if (id && dialogStore.replies.indexOf(id) === -1) {
        dialogStore.pushReply(id)
      }
    } else {
      dialogStore.closeReply()
    }
  }, [params, router.latestLocation.pathname])

  const handleClose = useCallback(() => {
    dialogStore.closeReply()
    goBack()
  }, [])

  return (
    <>
      {dialogStore.replies.map((id, index) => (
        <DialogSheet key={index} mobileAnchor='full' open={Boolean(id)} onClose={handleClose} maxWidth='sm'>
          <PostRepliesDialog noteId={typeof id !== 'boolean' ? id : undefined} />
        </DialogSheet>
      ))}
    </>
  )
})

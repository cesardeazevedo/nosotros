import { useMatch, useParams, useRouter } from '@tanstack/react-router'
import Dialog from 'components/elements/Layouts/Dialog'
import PostRepliesDialog from 'components/elements/Posts/PostReplies/PostRepliesDialog'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { dialogStore } from 'stores/ui/dialogs.store'
import { decodeNIP19, type Nevent } from 'utils/nip19'

const RepliesDialog = observer(function RepliesDialog() {
  const router = useRouter()
  const goBack = useGoBack()
  useMatch({ from: '__root__' })
  const params = useParams({ strict: false })

  useEffect(() => {
    const id = params.nostr ? decodeNIP19(params.nostr as Nevent)?.data?.id : undefined
    if (router.latestLocation.pathname.includes('/replies')) {
      if (id && dialogStore.replies.indexOf(id) === -1) {
        dialogStore.pushReply(id)
      } else {
        dialogStore.closeReply()
      }
    } else {
      dialogStore.resetReply()
    }
  }, [params, router.latestLocation.pathname])

  return (
    <>
      {dialogStore.replies.map((id, index) => (
        <Dialog key={index} maxWidth='sm' mobileHeight='90%' open={Boolean(id)}
          onClose={goBack}
        >
          <PostRepliesDialog noteId={typeof id !== 'boolean' ? id : undefined} />
        </Dialog>
      ))}
    </>
  )
})

export default RepliesDialog

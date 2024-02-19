import { useMatch, useParams, useRouter } from '@tanstack/react-router'
import Dialog from 'components/elements/Layouts/Dialog'
import PostRepliesDialog from 'components/elements/Posts/PostReplies/PostRepliesDialog'
import { useGoBack } from 'hooks/useNavigations'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { decodeNIP19, type Nevent } from 'utils/nip19'

const RepliesDialog = observer(function RepliesDialog() {
  const store = useStore()
  const router = useRouter()
  const goBack = useGoBack()
  useMatch({ from: '__root__' })
  const params = useParams({ from: '/$nostr/replies' })

  useEffect(() => {
    const id = params.nostr ? decodeNIP19(params.nostr as Nevent)?.data?.id : undefined
    if (router.latestLocation.pathname.includes('/replies')) {
      if (id && store.dialogs.replies.indexOf(id) === -1) {
        store.dialogs.pushReply(id)
      } else {
        store.dialogs.closeReply()
      }
    } else {
      store.dialogs.resetReply()
    }
  }, [store, params, router.latestLocation.pathname])

  return (
    <>
      {store.dialogs.replies.map((id, index) => (
        <Dialog key={index} maxWidth='sm' mobileHeight='90%' open={Boolean(id)} onClose={goBack}>
          <PostRepliesDialog noteId={typeof id !== 'boolean' ? id : undefined} />
        </Dialog>
      ))}
    </>
  )
})

export default RepliesDialog

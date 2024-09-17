import { useMatch, useRouter } from '@tanstack/react-router'
import Dialog from 'components/elements/Layouts/Dialog'
import SignIn from 'components/elements/SignIn/SignIn'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { dialogStore } from 'stores/ui/dialogs.store'

const SignInDialog = observer(function SignInDialog() {
  useMatch({ from: '__root__' })
  const router = useRouter()
  const goBack = useGoBack()

  const handleClose = useCallback(() => {
    dialogStore.closeAuth()
    goBack()
  }, [goBack])

  return (
    <Dialog
      maxWidth='xs'
      open={dialogStore.auth || router.latestLocation.pathname === '/sign_in'}
      onClose={handleClose}>
      <SignIn />
    </Dialog>
  )
})

export default SignInDialog

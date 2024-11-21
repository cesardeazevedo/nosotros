import { useMatch, useRouter } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { SignIn } from 'components/elements/SignIn/SignIn'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

export const SignInDialog = observer(function SignInDialog() {
  useMatch({ from: '__root__' })
  const router = useRouter()
  const goBack = useGoBack()

  const handleClose = useCallback(() => {
    goBack()
  }, [goBack])

  return (
    <DialogSheet maxWidth='xs' open={router.latestLocation.pathname.includes('/sign_in')} onClose={handleClose}>
      <SignIn />
    </DialogSheet>
  )
})

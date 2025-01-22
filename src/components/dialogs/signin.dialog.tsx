import { signinStore } from '@/stores/signin/signin.store'
import { useMatch } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { SignIn } from 'components/elements/SignIn/SignIn'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

export const SignInDialog = observer(function SignInDialog() {
  const match = useMatch({
    from: '__root__',
    // @ts-ignore
    select: (x) => x.search.sign_in === true,
  })
  const goBack = useGoBack()

  const handleClose = useCallback(() => {
    signinStore.reset()
    goBack()
  }, [goBack])

  return (
    <DialogSheet maxWidth='xs' open={match} onClose={handleClose}>
      <SignIn />
    </DialogSheet>
  )
})

import { signinStore } from '@/stores/signin/signin.store'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { SignIn } from 'components/elements/SignIn/SignIn'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

export const SignInDialog = observer(function SignInDialog() {
  const match = useMatch({
    from: '__root__',
    select: (x) => x.search.sign_in === true,
  })
  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    signinStore.reset()
    navigate({ to: '.', search: ({ sign_in, ...rest }) => rest })
  }, [])

  return (
    <DialogSheet maxWidth='xs' open={match} onClose={handleClose}>
      <SignIn />
    </DialogSheet>
  )
})

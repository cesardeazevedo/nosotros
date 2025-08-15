import { resetSigninAtom } from '@/atoms/signin.atoms'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { SignIn } from 'components/elements/SignIn/SignIn'
import { useSetAtom } from 'jotai'
import { memo, useCallback } from 'react'

export const SignInDialog = memo(function SignInDialog() {
  const match = useMatch({
    from: '__root__',
    select: (x) => x.search.sign_in === true,
  })
  const navigate = useNavigate()
  const resetSignin = useSetAtom(resetSigninAtom)

  const handleClose = useCallback(() => {
    resetSignin()
    navigate({ to: '.', search: ({ sign_in, ...rest }) => rest })
  }, [])

  return (
    <DialogSheet maxWidth='xs' open={match} onClose={handleClose}>
      <SignIn />
    </DialogSheet>
  )
})

import { Alert, Box, Button, Link, Typography } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { authStore } from 'stores/ui/auth.store'

type Props = {
  onClickManual: () => void
}

const SignInIntro = observer(function SignInIntro(props: Props) {
  const isMobile = useMobile()

  const handleLoginWithNostrExtension = useCallback(() => {
    authStore.loginWithNostrExtension()
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      {isMobile && (
        <Typography variant='h4' sx={{ fontWeight: 400, ml: 4 }}>
          Sign In
        </Typography>
      )}
      <Box>
        {authStore.hasExtension && (
          <Alert severity='success' sx={{ mt: 0, border: 'none' }}>
            Nostr extension detected
          </Alert>
        )}
        <Button
          size='large'
          color='primary'
          variant='text'
          fullWidth
          sx={{ mt: 1, height: 50, backgroundColor: 'action.hover' }}
          disabled={!authStore.hasExtension}
          onClick={handleLoginWithNostrExtension}>
          Sign In with Nostr extension
        </Button>
        <Typography variant='body2' sx={{ textAlign: 'center', m: 'auto', mt: 1, width: '90%' }}>
          {authStore.hasExtension === false && (
            <strong>
              Nostr extension not found.
              <br />
            </strong>
          )}
          It&apos;s recommended you sign in by using a Nostr browser extension such as Alby, Nos2x or{' '}
          <Link
            color='primary'
            href='https://github.com/nostr-protocol/nips/blob/master/07.md'
            target='_blank'
            rel='noopener noreferrer'>
            others
          </Link>
          , This is the most secure way to use any nostr client, without exposing your private key (nsec), if you are in
          a browser with no support for extensions (like on mobile), use the manual sign in option below.
        </Typography>
        <Typography variant='button' component='div' sx={{ width: '100%', textAlign: 'center', my: 4 }}>
          OR
        </Typography>
        <Box sx={{ mt: 0, borderRadius: 1, p: 0 }}>
          <Button
            fullWidth
            variant='contained'
            color='info'
            size='large'
            sx={{ mt: 0, height: 50 }}
            onClick={props.onClickManual}>
            Manually Sign In
          </Button>
          <Typography variant='body2' sx={{ textAlign: 'center', m: 'auto', mt: 1, width: '80%' }}>
            Sign In with your public key (npub).
          </Typography>
        </Box>
      </Box>
    </Box>
  )
})

export default SignInIntro

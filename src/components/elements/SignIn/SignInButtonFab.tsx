import { Fab } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import LinkSignIn from '../Navigation/LinkSignIn'

function SignInButtonFab() {
  const isMobile = useMobile()
  return (
    <>
      {isMobile && (
        <LinkSignIn>
          <Fab
            size='large'
            color='info'
            variant='extended'
            sx={{ margin: 'auto', position: 'fixed', left: 0, right: 0, bottom: 90, width: 120 }}>
            Join Nostr
          </Fab>
        </LinkSignIn>
      )}
    </>
  )
}

export default SignInButtonFab

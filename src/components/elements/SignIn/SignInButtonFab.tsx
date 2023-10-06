import { Fab } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { useStore } from 'stores'

function SignInButtonFab() {
  const store = useStore()
  const isMobile = useMobile()
  return (
    <>
      {isMobile && (
        <Fab
          variant='extended'
          color='primary'
          size='large'
          sx={{ margin: 'auto', position: 'fixed', left: 0, right: 0, bottom: 90, width: 120 }}
          onClick={() => store.dialogs.openAuth()}>
          Join Nostr
        </Fab>
      )}
    </>
  )
}

export default SignInButtonFab

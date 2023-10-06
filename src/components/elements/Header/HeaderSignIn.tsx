import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import ProfilePopover from '../Navigation/ProfilePopover'

const HeaderSignIn = observer(function HeaderSignIn() {
  const store = useStore()
  return (
    <>
      {!store.auth.pubkey ? (
        <Button variant='contained' size='small' color='info' onClick={store.dialogs.openAuth}>
          Sign In
        </Button>
      ) : (
        <ProfilePopover />
      )}
    </>
  )
})

export default HeaderSignIn

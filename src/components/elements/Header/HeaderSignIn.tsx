import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import LinkSignIn from '../Navigation/LinkSignIn'
import ProfilePopover from '../Navigation/ProfilePopover'

const HeaderSignIn = observer(function HeaderSignIn() {
  const store = useStore()
  return (
    <>
      {!store.auth.pubkey ? (
        <LinkSignIn>
          <Button variant='contained' size='small' color='info'>
            Sign In
          </Button>
        </LinkSignIn>
      ) : (
        <ProfilePopover />
      )}
    </>
  )
})

export default HeaderSignIn

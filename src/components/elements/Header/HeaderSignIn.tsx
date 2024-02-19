import { Button } from '@mui/material'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import LinkSignIn from '../Links/LinkSignIn'
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

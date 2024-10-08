import { Button } from '@/components/ui/Button/Button'
import { observer } from 'mobx-react-lite'
import { authStore } from 'stores/ui/auth.store'
import LinkSignIn from '../Links/LinkSignIn'
import ProfilePopover from '../Navigation/ProfilePopover'

const HeaderSignIn = observer(function HeaderSignIn() {
  return (
    <>
      {!authStore.pubkey ? (
        <LinkSignIn>
          <Button variant='filled'>Sign In</Button>
        </LinkSignIn>
      ) : (
        <ProfilePopover />
      )}
    </>
  )
})

export default HeaderSignIn

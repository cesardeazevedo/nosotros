import { Button } from '@/components/ui/Button/Button'
import { observer } from 'mobx-react-lite'
import { authStore } from '@/stores/ui'
import { LinkSignIn } from '../Links/LinkSignIn'
import { ProfilePopover } from '../Navigation/ProfilePopover'

export const HeaderSignIn = observer(function HeaderSignIn() {
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

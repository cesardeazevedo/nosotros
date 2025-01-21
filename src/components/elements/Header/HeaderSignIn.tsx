import { Button } from '@/components/ui/Button/Button'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { LinkSignIn } from '../Links/LinkSignIn'
import { ProfilePopover } from '../Navigation/ProfilePopover'

export const HeaderSignIn = observer(function HeaderSignIn() {
  const pubkey = useCurrentPubkey()
  return (
    <>
      {!pubkey ? (
        <LinkSignIn>
          <Button variant='filled'>Sign In</Button>
        </LinkSignIn>
      ) : (
        <ProfilePopover />
      )}
    </>
  )
})

import { LinkSignIn } from '@/components/elements/Links/LinkSignIn'
import { UserProfileHeader } from '@/components/elements/User/UserProfileHeader'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const SettingsProfileRoute = observer(() => {
  const user = useCurrentUser()
  return (
    <>
      <Stack sx={styles.root}>
        {user && <UserProfileHeader user={user} />}
        {!user && (
          <LinkSignIn>
            <Button variant='filled'>Sign In</Button>
          </LinkSignIn>
        )}
      </Stack>
    </>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding4,
  },
})

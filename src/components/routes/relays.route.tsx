import { useFollowingUsers } from '@/hooks/useFollowingUsers'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useRootStore'
import { READ, WRITE } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { IconPencil } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { CenteredContainer } from '../elements/Layouts/CenteredContainer'
import { RelayDiscovery } from '../elements/RelayDiscovery/RelayDiscovery'
import { RelayMailboxList } from '../elements/Relays/RelayMailboxList'
import { Button } from '../ui/Button/Button'
import { Stack } from '../ui/Stack/Stack'
import { Text } from '../ui/Text/Text'

export const RelayRoute = observer(function RelayRoute() {
  const [isEditing, setIsEditing] = useState(false)
  const user = useCurrentUser()
  const pubkey = useCurrentPubkey()
  const mobile = useMobile()
  useFollowingUsers()
  return (
    <CenteredContainer margin sx={styles.root}>
      <Stack horizontal={false} gap={mobile ? 0 : 4}>
        {pubkey && (
          <html.div>
            <Stack justify='space-between' gap={4} sx={[styles.header, mobile && styles.header$mobile]}>
              <Text variant='display' size='sm'>
                Mailbox Relays
              </Text>
              <Button
                onClick={() => setIsEditing((prev) => !prev)}
                icon={!isEditing && <IconPencil size={18} />}
                variant={isEditing ? 'danger' : 'filled'}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </Stack>
            <Stack horizontal gap={mobile ? 0 : 2} justify='space-between' align='flex-start' wrap>
              <RelayMailboxList isEditing={isEditing} user={user!} permission={WRITE} />
              <RelayMailboxList isEditing={isEditing} user={user!} permission={READ} />
            </Stack>
          </html.div>
        )}
        <RelayDiscovery />
      </Stack>
    </CenteredContainer>
  )
})

const styles = css.create({
  root: {
    maxWidth: 960,
  },
  header: {
    marginBottom: spacing.margin4,
  },
  header$mobile: {
    padding: spacing.padding2,
    paddingBottom: 0,
  },
})

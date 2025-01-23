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
  return (
    <CenteredContainer margin sx={styles.root}>
      {pubkey && (
        <html.div style={styles.mailboxes}>
          <Stack justify='space-between' gap={4}>
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
          <Stack horizontal gap={2} justify='space-between' align='flex-start'>
            <RelayMailboxList isEditing={isEditing} user={user!} permission={WRITE} />
            <RelayMailboxList isEditing={isEditing} user={user!} permission={READ} />
          </Stack>
        </html.div>
      )}
      <RelayDiscovery />
    </CenteredContainer>
  )
})

const styles = css.create({
  root: {
    maxWidth: 960,
  },
  mailboxes: {
    marginBottom: spacing.margin4,
  },
})

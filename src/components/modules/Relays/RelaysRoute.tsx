import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { RelayMailboxList } from '@/components/elements/Relays/RelayMailboxList'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { READ, WRITE } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { IconPencil } from '@tabler/icons-react'
import { memo, useState } from 'react'
import { css, html } from 'react-strict-dom'

export const RelayRoute = memo(function RelayRoute() {
  const [isEditing, setIsEditing] = useState(false)
  const pubkey = useCurrentPubkey()
  const mobile = useMobile()
  useResetScroll()
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
              <RelayMailboxList isEditing={isEditing} pubkey={pubkey} permission={WRITE} />
              <RelayMailboxList isEditing={isEditing} pubkey={pubkey} permission={READ} />
            </Stack>
          </html.div>
        )}
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

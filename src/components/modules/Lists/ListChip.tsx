import { setListFormDialogAtom } from '@/atoms/dialog.atoms'
import { IconUsersGroupFilled } from '@/components/elements/Icons/IconUsersGroupFilled'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { spacing } from '@/themes/spacing.stylex'
import { useSetAtom } from 'jotai'
import { memo, useState } from 'react'
import { css } from 'react-strict-dom'
import { FollowBulkButton } from '../Follows/FollowBulkButton'
import { FollowButton } from '../Follows/FollowButton'

type Props = {
  event: NostrEventDB
}

export const ListChip = memo(function ListChip(props: Props) {
  const { event } = props
  const [open, setOpen] = useState(false)
  const setListFormDialog = useSetAtom(setListFormDialogAtom)
  const pubkey = useCurrentPubkey()
  const pubkeys = useEventTags(event, 'p')
  const dTag = useEventTag(event, 'd')
  const titleTag = useEventTag(event, 'title')
  const title = (titleTag || dTag) + ` (${pubkeys?.length || ''})`

  return (
    <PopoverBase
      opened={open}
      onClose={() => setOpen(false)}
      floatingStrategy='fixed'
      placement='bottom-start'
      contentRenderer={() => (
        <Paper outlined surface='surfaceContainerLow' sx={styles.popover}>
          <Stack sx={styles.header} justify='space-between' gap={4}>
            <Text size='lg'>{title}</Text>
            <Stack gap={0.5}>
              {pubkey === event.pubkey && (
                <Button
                  variant='outlined'
                  onClick={() => {
                    setOpen(false)
                    setListFormDialog(event)
                  }}>
                  Edit
                </Button>
              )}
              <FollowBulkButton values={pubkeys} />
            </Stack>
          </Stack>
          <Stack horizontal={false} align='stretch' gap={0.5} sx={styles.maxHeight}>
            {pubkeys.map((pubkey) => (
              <Stack grow key={pubkey} justify='space-between' gap={2}>
                <Stack sx={styles.userHeader}>
                  <UserHeader grow key={pubkey} pubkey={pubkey} userAvatarProps={{ size: 'sm' }} />
                </Stack>
                <FollowButton value={pubkey} sx={styles.followButton} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}>
      {({ getProps, setRef }) => (
        <Chip
          {...getProps()}
          ref={setRef}
          label={title}
          icon={<IconUsersGroupFilled size={18} />}
          onClick={() => setOpen(true)}
        />
      )}
    </PopoverBase>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
  popover: {
    minWidth: 240,
    position: 'relative',
    right: spacing.margin1,
  },
  maxHeight: {
    overflowY: 'auto',
    padding: spacing.padding1,
    maxHeight: 400,
  },
  userHeader: {
    flex: 1,
    minWidth: 200,
  },
  followButton: {
    width: 76,
    minWidth: 76,
    minHeight: 30,
  },
})

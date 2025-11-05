import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { useNoteState } from '@/hooks/state/useNote'
import { useUserState } from '@/hooks/state/useUser'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { memo, useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { ThreadItem } from '../elements/Threads/ThreadItem'
import { ContentProvider } from '../providers/ContentProvider'
import { NoteProvider } from '../providers/NoteProvider'
import { Button } from '../ui/Button/Button'
import { Divider } from '../ui/Divider/Divider'
import { Stack } from '../ui/Stack/Stack'
import { Text } from '../ui/Text/Text'

const ThreadItemInternal = (props: { event: NostrEventDB; onCancel: () => void }) => {
  const note = useNoteState(props.event, { replying: true, repliesOpen: false, contentOpen: false })
  return (
    <NoteProvider value={{ event: props.event }}>
      <ContentProvider value={{ disableLink: false, isDialog: true }}>
        <ThreadItem note={note} renderEditor renderReplies={false} repliesLimit={1} onEditorDiscard={props.onCancel} />
      </ContentProvider>
    </NoteProvider>
  )
}

export const ReplyDialog = memo(function ReplyDialog() {
  const navigate = useNavigate()
  const parentId = useMatch({
    from: '__root__',
    select: (x) => x.search.replying,
  })
  const event = useEventFromNIP19(parentId || '')
  const user = useUserState(event.data?.pubkey || '')

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ replying, ...rest }) => rest })
  }, [])

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} open={!!parentId} onClose={handleClose}>
      <html.div style={styles.root}>
        <Stack sx={styles.header} align='center' justify='space-between'>
          <Button onClick={handleClose}>Cancel</Button>
          <Stack grow align='center' justify='center'>
            <strong>
              <Text variant='title' size='lg'>
                Reply to {user.displayName}
              </Text>
            </strong>
          </Stack>
          <div style={{ width: 50 }} />
        </Stack>
        <Divider />
        {event.data && <ThreadItemInternal event={event.data} onCancel={handleClose} />}
      </html.div>
    </DialogSheet>
  )
})

const styles = css.create({
  dialog: {
    padding: spacing.padding1,
  },
  root: {
    position: 'relative',
  },
  header: {
    padding: spacing.padding1,
  },
})

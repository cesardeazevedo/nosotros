import { Kind } from '@/constants/kinds'
import { spacing } from '@/themes/spacing.stylex'
import { encodeSafe } from '@/utils/nip19'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { useGoBack } from 'hooks/useNavigations'
import { nip19, type NostrEvent } from 'nostr-tools'
import { memo, useCallback, useRef } from 'react'
import { css } from 'react-strict-dom'
import type { EditorRef } from '../elements/Editor/EditorProvider'
import { EditorProvider } from '../elements/Editor/EditorProvider'
import { UserChip } from '../elements/User/UserChip'
import { Button } from '../ui/Button/Button'
import { Divider } from '../ui/Divider/Divider'
import { Stack } from '../ui/Stack/Stack'
import { Text } from '../ui/Text/Text'

export const EditorDialog = memo(function EditorDialog() {
  const ref = useRef<EditorRef | null>(null)
  const open = useMatch({
    from: '__root__',
    select: (x) => !!x.search.compose,
  })
  const kind = useMatch({
    from: '__root__',
    select: (x) => x.search.compose_kind || Kind.Text,
  })
  const pubkey = useMatch({
    from: '__root__',
    select: (x) => x.search.pubkey,
  })
  const goBack = useGoBack()

  const navigate = useNavigate()

  const handleSigned = useCallback(
    (event: NostrEvent, relays: string[] = []) => {
      const nevent = encodeSafe(() =>
        nip19.neventEncode({ id: event.id, relays, kind: event.kind, author: event.pubkey }),
      )
      if (nevent) {
        navigate({ to: '/$nostr', params: { nostr: nevent } })
      }
    },
    [navigate],
  )

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ compose, ...rest }) => rest })
  }, [goBack])

  const handleUndo = (event: NostrEvent) => {
    // We send the user to home so he doesn't see the event he just deleted
    navigate({ to: '/', search: (rest) => ({ ...rest, compose: true }) })
    setTimeout(() => {
      if (ref.current && ref.current.editor) {
        ref.current.editor.commands.setEventContent(event)
      }
    }, 100)
  }

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} open={open} onClose={handleClose}>
      <Stack sx={styles.header} align='center' justify='space-between'>
        <Button onClick={handleClose}>Cancel</Button>
        <Stack grow align='center' justify='center'>
          <strong>
            <Text variant='title' size='lg'>
              {kind === Kind.PublicMessage ? (
                <Stack gap={1}>
                  Send Public Message
                  <a href='https://github.com/nostr-protocol/nips/pull/1988' target='_blank' rel='noreferrer'>
                    <Text variant='title' size='md'>
                      (kind-24)
                    </Text>
                  </a>
                </Stack>
              ) : (
                'New Post'
              )}
            </Text>
          </strong>
        </Stack>
        <div style={{ width: 50 }} />
      </Stack>
      <Divider />
      <EditorProvider
        initialOpen
        floatToolbar
        ref={ref}
        kind={kind}
        pubkey={pubkey}
        onSigned={handleSigned}
        onDiscard={handleClose}
        onUndoBroadcast={handleUndo}
        headerComponent={
          pubkey && (
            <Stack align='flex-start'>
              <UserChip pubkey={pubkey} />
            </Stack>
          )
        }
        sx={styles.editor}
      />
    </DialogSheet>
  )
})

const styles = css.create({
  dialog: {
    padding: spacing.padding1,
  },
  editor: {
    minHeight: 260,
  },
  header: {
    padding: spacing.padding1,
  },
})

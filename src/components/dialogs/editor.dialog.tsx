import { Kind } from '@/constants/kinds'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { useGoBack } from 'hooks/useNavigations'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import { EditorProvider } from '../elements/Editor/EditorProvider'
import { UserChip } from '../elements/User/UserChip'
import { Button } from '../ui/Button/Button'
import { Divider } from '../ui/Divider/Divider'
import { Stack } from '../ui/Stack/Stack'
import { Text } from '../ui/Text/Text'

export const EditorDialog = memo(function EditorDialog() {
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

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ compose, ...rest }) => rest })
  }, [goBack])

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
        kind={kind}
        pubkey={pubkey}
        onSuccess={handleClose}
        onDiscard={handleClose}
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

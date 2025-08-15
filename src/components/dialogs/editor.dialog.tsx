import { spacing } from '@/themes/spacing.stylex'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { useGoBack } from 'hooks/useNavigations'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import { EditorProvider } from '../elements/Editor/EditorProvider'
import { Button } from '../ui/Button/Button'
import { Divider } from '../ui/Divider/Divider'
import { Stack } from '../ui/Stack/Stack'
import { Text } from '../ui/Text/Text'

export const EditorDialog = memo(function EditorDialog() {
  const open = useMatch({
    from: '__root__',
    select: (x) => !!x.search.compose,
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
              New Post
            </Text>
          </strong>
        </Stack>
        <div style={{ width: 50 }} />
      </Stack>
      <Divider />
      <EditorProvider initialOpen floatToolbar onDiscard={handleClose} sx={styles.editor} />
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

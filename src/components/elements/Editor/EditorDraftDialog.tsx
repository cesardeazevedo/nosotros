import { DialogSheet } from '@/components/elements/Layouts/Dialog'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconX } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  open: boolean
  onClose: () => void
  onCancel: () => void
  onSaveDraft: () => void
}

export const EditorDraftDialog = memo(function EditorDraftDialog(props: Props) {
  const { open, onClose, onCancel, onSaveDraft } = props

  return (
    <DialogSheet open={open} onClose={onClose} maxWidth='sm'>
      <Stack horizontal={false} sx={styles.root}>
        <Stack sx={styles.header} justify='space-between' align='center'>
          <IconButton
            size='md'
            onClick={onClose}
            sx={styles.closeButton}
            icon={<IconX size={24} />}
            aria-label='Close'
          />
          <Text variant='title' size='lg'>
            Save draft?
          </Text>
          <Stack sx={styles.headerSpacer} />
        </Stack>
        <Divider />
        <Stack horizontal={false} gap={1} sx={styles.content}>
          <Text variant='title' size='lg' sx={styles.message}>
            You have unsent changes.
          </Text>
        </Stack>
        <Divider />
        <Stack sx={styles.footer} justify='flex-end' gap={1}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant='filled' onClick={onSaveDraft}>
            Save draft
          </Button>
        </Stack>
      </Stack>
    </DialogSheet>
  )
})

const styles = css.create({
  root: {
    width: '100%',
  },
  header: {
    padding: spacing.padding1,
  },
  closeButton: {
    marginLeft: 0,
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.padding2,
  },
  footer: {
    padding: spacing.padding1,
  },
  message: {
    textAlign: 'center',
  },
})

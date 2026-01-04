import { spacing } from '@/themes/spacing.stylex'
import { useMatch, useNavigate } from '@tanstack/react-router'
import type { Editor } from '@tiptap/core'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { memo, useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../elements/Editor/EditorProvider'
import { Button } from '../ui/Button/Button'
import { Divider } from '../ui/Divider/Divider'
import { Stack } from '../ui/Stack/Stack'
import { Text } from '../ui/Text/Text'

export const EditorQuoteDialog = memo(function EditorQuoteDialog() {
  const quoting = useMatch({
    from: '__root__',
    select: (x) => x.search.quoting,
  })
  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ quoting, ...rest }) => rest })
  }, [])

  const handleEditor = (props: { editor: Editor | null } | null) => {
    const editor = props?.editor
    if (quoting && editor) {
      if (quoting.startsWith('nevent')) {
        editor
          .chain()
          .insertContent({ type: 'text', text: ' ' })
          .insertNEvent({ bech32: 'nostr:' + quoting })
          .run()
      } else {
        editor
          .chain()
          .insertContent({ type: 'text', text: '\n' })
          .insertNAddr({ bech32: 'nostr:' + quoting })
          .run()
      }
      setTimeout(() => editor.commands.focus('start'))
    }
  }

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} open={!!quoting} onClose={handleClose}>
      <html.div style={styles.root}>
        <Stack sx={styles.header} align='center' justify='space-between'>
          <Button onClick={handleClose}>Cancel</Button>
          <Stack grow align='center' justify='center'>
            <strong>
              <Text variant='title' size='lg'>
                Quote a post
              </Text>
            </strong>
          </Stack>
          <div style={{ width: 50 }} />
        </Stack>
        <Divider />
        <EditorProvider initialOpen floatToolbar ref={handleEditor} onDiscard={handleClose} />
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

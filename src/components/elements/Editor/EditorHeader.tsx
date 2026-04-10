import { useContentContext } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkSignIn } from '../Links/LinkSignIn'
import { UserName } from '../User/UserName'
import { useEditorSelector } from './hooks/useEditor'

export const EditorHeader = memo(function EditorHeader() {
  const open = useEditorSelector((editor) => editor.open)
  const section = useEditorSelector((editor) => editor.section)
  const openSection = useEditorSelector((editor) => editor.openSection)
  const parent = useEditorSelector((editor) => editor.parent)
  const pubkey = useCurrentPubkey()
  const { dense } = useContentContext()
  if (!open || dense) {
    return null
  }
  if (!pubkey) {
    return (
      <LinkSignIn>
        <Stack gap={1}>
          <Text variant='title' size='md'>
            Signin to create a new note
          </Text>
        </Stack>
      </LinkSignIn>
    )
  }

  if (parent) {
    return (
      <UserName pubkey={pubkey} />
    )
  }

  return (
    <Stack grow justify='space-between'>
      <UserName pubkey={pubkey} />
      <Button
        variant={section === 'drafts' ? 'filledTonal' : 'text'}
        sx={styles.draftButton}
        onClick={() => openSection('drafts')}>
        Drafts
      </Button>
    </Stack>

  )
})

const styles = css.create({
  draftButton: {
    height: 32,
    position: 'absolute',
    right: 8,
  },
})

import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { memo } from 'react'
import { LinkSignIn } from '../Links/LinkSignIn'
import { UserName } from '../User/UserName'
import { useEditorSelector } from './hooks/useEditor'

export const EditorHeader = memo(function EditorHeader() {
  const open = useEditorSelector((editor) => editor.open)
  const pubkey = useCurrentPubkey()
  const { dense } = useContentContext()
  return (
    open &&
    !dense && (
      <>
        {pubkey ? (
          <motion.div
            key='username'
            initial={{ translateY: -6, opacity: 0 }}
            animate={{ translateY: 2, opacity: 1 }}
            exit={{ translateY: -6, opacity: 0 }}>
            <UserName pubkey={pubkey} />
          </motion.div>
        ) : (
          <LinkSignIn>
            <Stack gap={1}>
              <Text variant='title' size='md'>
                Signin
              </Text>
            </Stack>
          </LinkSignIn>
        )}
      </>
    )
  )
})

import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import type { EditorStore } from '@/stores/editor/editor.store'
import { motion } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import { LinkSignIn } from '../Links/LinkSignIn'
import { UserName } from '../User/UserName'

type Props = {
  store: EditorStore
}

export const EditorHeader = observer(function EditorHeader(props: Props) {
  const { store } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()
  return (
    store.open.value &&
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

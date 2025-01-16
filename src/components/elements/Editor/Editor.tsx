import { EditorTiptap } from '@/components/elements/Editor/EditorTiptap'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { useRootContext } from '@/hooks/useRootStore'
import type { EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { typeFace } from '@/themes/typeFace.stylex'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import { motion } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { css } from 'react-strict-dom'
import { BubbleContainer } from '../Content/Layout/Bubble'
import { EditorBroadcaster } from './EditorBroadcaster'
import { EditorHeader } from './EditorHeader'
import { EditorMentions } from './EditorMentions'
import { EditorPow } from './EditorPow'
import { EditorSettings } from './EditorSettings'
import { EditorSubmit } from './EditorSubmit'
import { EditorToolbar } from './EditorToolbar'
import { EditorActionsPopover } from './EditorToolbarPopover'

type Props = {
  dense?: boolean
  store: EditorStore
  initialOpen?: boolean
  renderDiscard?: boolean
  renderBubble?: boolean
  sx?: SxProps
}

export const Editor = observer(function Editor(props: Props) {
  const { store, initialOpen, dense = false, renderDiscard = true, renderBubble = false, sx } = props

  const context = useRootContext()

  useEffect(() => {
    store.setContext(context)
  }, [context])

  useEffect(() => {
    store.open.toggle(initialOpen)
  }, [])

  const Container = renderBubble ? BubbleContainer : Stack
  const ContainerProps = renderBubble
    ? { sx: styles.bubble }
    : ({ horizontal: false, align: 'stretch', justify: 'center', grow: true } as StackProps)

  return (
    <>
      <Stack
        horizontal
        align='flex-start'
        justify='space-between'
        gap={renderBubble ? 1 : 2}
        onClick={() => store.setOpen()}
        sx={[styles.root, dense && styles.root$dense, store.open && styles.root$open, sx]}>
        <UserAvatar disabledPopover disableLink size='md' pubkey={context.user?.pubkey} />
        <Container {...ContainerProps}>
          <Stack horizontal={false} grow>
            <Stack sx={[styles.content, dense && styles.content$dense]} gap={2} align='flex-start'>
              <Stack horizontal={false} sx={styles.wrapper}>
                <Stack justify='space-between' sx={styles.header}>
                  {store.open.value && !dense && (
                    <motion.div
                      key='username'
                      initial={{ translateY: -6, opacity: 0 }}
                      animate={{ translateY: 2, opacity: 1 }}
                      exit={{ translateY: -6, opacity: 0 }}>
                      <EditorHeader />
                    </motion.div>
                  )}
                </Stack>
                {store.open.value ? (
                  <EditorTiptap key='editor' dense={dense} store={store} placeholder={store.placeholder} />
                ) : (
                  <Stack sx={styles.placeholder}>
                    <Text size='lg' variant='body' sx={styles.placeholder$label}>
                      {store.placeholder}
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Stack>
            {store.open.value && (
              <>
                {renderBubble && (
                  <EditorActionsPopover store={store}>
                    <EditorSubmit dense={dense} store={store} renderDiscard={renderDiscard} />
                  </EditorActionsPopover>
                )}
                {!renderBubble && (
                  <EditorToolbar dense={dense} store={store}>
                    <EditorSubmit dense={dense} store={store} renderDiscard={renderDiscard} />
                  </EditorToolbar>
                )}
              </>
            )}
          </Stack>
        </Container>
      </Stack>
      {!renderBubble && (
        <>
          <Expandable expanded={store.section === 'broadcast'}>
            <Divider />
            <EditorBroadcaster store={store} />
          </Expandable>
          <Expandable expanded={store.section === 'mentions'}>
            <Divider />
            <EditorMentions key='mentions' store={store} />
          </Expandable>
          <Expandable expanded={store.section === 'settings'}>
            <Divider />
            <EditorSettings key='json' store={store} />
          </Expandable>
          {/* eslint-disable-next-line no-constant-binary-expression */}
          {false && (
            <Expandable expanded={store.section === 'pow'}>
              <Divider />
              <EditorPow key='pow' editor={store} />
            </Expandable>
          )}
        </>
      )}
    </>
  )
})

const styles = css.create({
  root: {
    cursor: 'pointer',
    width: '100%',
    padding: spacing.padding1,
  },
  root$dense: {},
  root$open: {
    cursor: 'inherit',
  },
  header: {
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    wordBreak: 'break-word',
  },
  content$dense: {
    padding: spacing['padding0.5'],
    paddingBlock: 0,
  },
  wrapper: {
    width: '100%',
  },
  bubble: {
    width: '100%',
  },
  placeholder: {
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: 40,
    opacity: 0.6,
  },
  placeholder$label: {
    fontWeight: typeFace.medium,
  },
})

import { EditorTiptap } from '@/components/elements/Editor/EditorTiptap'
import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import type { EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import { useEffect } from 'react'
import { css } from 'react-strict-dom'
import { concat, concatMap, defer, endWith, from, map, mergeMap, startWith, takeUntil } from 'rxjs'
import { BubbleContainer } from '../Content/Layout/Bubble'
import { EditorContainer } from './EditorContainer'
import { EditorExpandables } from './EditorExpandables'
import { EditorHeader } from './EditorHeader'
import { EditorPlaceholder } from './EditorPlaceholder'
import { EditorSubmit } from './EditorSubmit'
import { EditorToolbar } from './EditorToolbar'
import { EditorActionsPopover } from './EditorToolbarPopover'
import { cancel$, countDown$ } from './utils/countDown'

type Props = {
  store: EditorStore
  initialOpen?: boolean
  renderDiscard?: boolean
  renderBubble?: boolean
  sx?: SxProps
  onDiscard?: () => void
}

export const Editor = observer(function Editor(props: Props) {
  const { store, initialOpen, renderDiscard = true, renderBubble = false, sx, onDiscard } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()

  useEffect(() => {
    store.open.toggle(initialOpen)
  }, [])

  const [submitState, submit] = useObservableState<string | number | boolean, void>((input$) => {
    return input$.pipe(
      concatMap(() => {
        const submit$ = defer(() => {
          return from(store.uploader!.start()).pipe(
            mergeMap(() => store.submit(store.rawEvent)),
            map(() => false),
            startWith(0),
          )
        })
        return concat(countDown$, submit$).pipe(takeUntil(cancel$), endWith(false))
      }),
    )
  }, false)

  const Container = renderBubble ? BubbleContainer : Stack
  const ContainerProps = renderBubble
    ? { sx: styles.bubble }
    : ({ horizontal: false, align: 'stretch', justify: 'center', grow: true } as StackProps)

  const EditorActions = renderBubble ? EditorActionsPopover : EditorToolbar

  return (
    <>
      <EditorContainer store={store} renderBubble={renderBubble} sx={sx}>
        <UserAvatar size='md' pubkey={pubkey} />
        <Container {...ContainerProps}>
          <Stack horizontal={false} grow>
            <Stack sx={[styles.content, dense && styles.content$dense]} gap={2} align='flex-start'>
              <Stack horizontal={false} sx={styles.wrapper}>
                <EditorHeader store={store} />
                {store.open.value ? (
                  <EditorTiptap key='editor' dense={dense} store={store} placeholder={store.placeholder} />
                ) : (
                  <EditorPlaceholder store={store} />
                )}
              </Stack>
            </Stack>
            {store.open.value && (
              <EditorActions store={store}>
                <EditorSubmit
                  store={store}
                  state={submitState}
                  disabled={store.isEmpty || store.isUploading.value}
                  renderDiscard={renderDiscard}
                  onSubmit={() => submit()}
                  onDiscard={onDiscard}
                />
              </EditorActions>
            )}
          </Stack>
        </Container>
      </EditorContainer>
      {!renderBubble && <EditorExpandables store={store} />}
    </>
  )
})

const styles = css.create({
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
})

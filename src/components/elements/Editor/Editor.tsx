import { EditorTiptap } from '@/components/elements/Editor/EditorTiptap'
import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { publish } from '@/nostr/publish/publish'
import { spacing } from '@/themes/spacing.stylex'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import type { NostrEvent } from 'nostr-tools'
import { useObservableState } from 'observable-hooks'
import type { ReactNode } from 'react'
import { memo, useEffect } from 'react'
import { css } from 'react-strict-dom'
import {
  catchError,
  concat,
  concatMap,
  defer,
  EMPTY,
  endWith,
  filter,
  from,
  map,
  mergeMap,
  of,
  startWith,
  takeUntil,
} from 'rxjs'
import { BubbleContainer } from '../Content/Layout/Bubble'
import { EditorContainer } from './EditorContainer'
import { EditorExpandables } from './EditorExpandables'
import { EditorHeader } from './EditorHeader'
import { EditorPlaceholder } from './EditorPlaceholder'
import type { EditorContextType } from './EditorProvider'
import { EditorSubmit } from './EditorSubmit'
import { EditorToolbar } from './EditorToolbar'
import { EditorActionsPopover } from './EditorToolbarPopover'
import { useEditorSelector } from './hooks/useEditor'
import { cancel$, countDown$ } from './utils/countDown'

export type Props = {
  sx?: SxProps
  initialOpen?: boolean
  renderDiscard?: boolean
  renderBubble?: boolean
  floatToolbar?: boolean
  headerComponent?: ReactNode
  onSuccess?: (event: NostrEvent) => void
  onDiscard?: () => void
}

export const Editor = memo(function Editor(props: Props) {
  const {
    initialOpen,
    renderDiscard = true,
    renderBubble = false,
    floatToolbar = renderBubble,
    headerComponent,
    sx,
    onDiscard,
    onSuccess,
  } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()

  const state = useEditorSelector((editor) => editor)

  const { mutateAsync } = usePublishEventMutation({
    mutationFn:
      ({ signer, pubkey }) =>
      () =>
        state.event ? publish({ ...state.event, pubkey }, { relays: state.allRelays, signer }) : EMPTY,
    onSuccess,
  })

  const isEmpty = state.event ? state.event.content === '' : true

  useEffect(() => {
    state.toggle('open', initialOpen)
    // Annoying and weird mobile issue with tiptap
    if (initialOpen && !('ontouchstart' in window)) {
      focus()
    }
  }, [initialOpen])

  const [submitState, submit] = useObservableState<string | number | boolean, EditorContextType | null>((input$) => {
    return input$.pipe(
      filter(Boolean),
      concatMap((state) => {
        const submit$ = defer(() => {
          return from(state.upload()).pipe(
            mergeMap(() => mutateAsync(state.event)),
            catchError(() => of(false)),
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
    ? { sx: styles.bubble, highlight: !state.open }
    : ({ horizontal: false, align: 'stretch', justify: 'center', grow: true } as StackProps)

  const EditorActions = floatToolbar ? EditorActionsPopover : EditorToolbar

  return (
    <>
      <EditorContainer open={state.open} onClick={() => state?.setOpen()} renderBubble={renderBubble} sx={sx}>
        {pubkey && <UserAvatar size='md' pubkey={pubkey} />}
        <Container {...ContainerProps} sx={styles.wrapper}>
          <Stack horizontal={false} grow>
            <Stack sx={[styles.content, dense && styles.content$dense]} gap={2} align='stretch'>
              <Stack horizontal={false} sx={styles.wrapper}>
                <EditorHeader />
                {headerComponent}
                {state.open ? <EditorTiptap key='editor' dense={dense} /> : <EditorPlaceholder />}
              </Stack>
            </Stack>
            {state.open && (
              <EditorActions>
                <EditorSubmit
                  state={submitState}
                  disabled={isEmpty || state.isUploading}
                  renderDiscard={renderDiscard}
                  onSubmit={() => submit(state)}
                  onDiscard={onDiscard}
                />
              </EditorActions>
            )}
          </Stack>
        </Container>
      </EditorContainer>
      {!floatToolbar && <EditorExpandables />}
    </>
  )
})

const styles = css.create({
  content: {
    flex: '1 1 auto',
    width: '100%',
    wordBreak: 'break-word',
  },
  content$dense: {
    padding: spacing['padding0.5'],
    paddingBlock: 0,
  },
  wrapper: {
    flex: '1 1 auto',
    width: '100%',
  },
  bubble: {
    width: '100%',
  },
})

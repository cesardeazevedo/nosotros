import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import {
  filesAtom,
  resetFileUploadAtom,
  resetIsUploadingAtom,
  selectFilesForUploadAtom,
  uploadFilesAtom,
} from '@/atoms/upload.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { publish } from '@/nostr/publish/publish'
import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoPlus } from '@tabler/icons-react'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import { useAtomValue, useSetAtom } from 'jotai'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import { useObservableState } from 'observable-hooks'
import { memo, useEffect } from 'react'
import { css } from 'react-strict-dom'
import {
  catchError,
  concat,
  concatMap,
  defer,
  EMPTY,
  endWith,
  from,
  map,
  mergeMap,
  startWith,
  takeUntil,
  tap,
} from 'rxjs'
import { MediaListEditor } from '../Media/MediaListEditor'
import { EditorContainer } from './EditorContainer'
import { EditorExpandables } from './EditorExpandables'
import { EditorHeader } from './EditorHeader'
import { EditorPlaceholder } from './EditorPlaceholder'
import { EditorSubmit } from './EditorSubmit'
import { EditorTiptap } from './EditorTiptap'
import { EditorToolbar } from './EditorToolbar'
import { useEditorSelector } from './hooks/useEditor'
import { cancel$, countDown$ } from './utils/countDown'

type Props = {
  initialOpen?: boolean
  renderDiscard?: boolean
  sx?: SxProps
  onDiscard?: () => void
  onSuccess?: (event: NostrEvent) => void
}

// For kind 20 notes
export const EditorMedia = memo(function EditorMedia(props: Props) {
  const { initialOpen, renderDiscard = true, onDiscard, onSuccess } = props
  const { dense } = useContentContext()
  const files = useAtomValue(filesAtom)
  const selectFiles = useSetAtom(selectFilesForUploadAtom)
  const uploadFiles = useSetAtom(uploadFilesAtom)
  const resetFiles = useSetAtom(resetFileUploadAtom)
  const resetUploadingFiles = useSetAtom(resetIsUploadingAtom)
  const enqueueToast = useSetAtom(enqueueToastAtom)

  const state = useEditorSelector((editor) => editor)
  const pubkey = useCurrentPubkey()

  const { mutateAsync } = usePublishEventMutation<EventTemplate>({
    mutationFn:
      ({ signer, pubkey }) =>
      (event) =>
        publish({ ...event, pubkey }, { relays: state.allRelays, signer }),
    onSuccess,
  })

  useEffect(() => {
    state.toggle('open', initialOpen)
    if (initialOpen && !('ontouchstart' in window)) {
      state.focus()
    }
  }, [initialOpen])

  const [submitState, submit] = useObservableState<string | number | boolean, EventTemplate>((input$) => {
    return input$.pipe(
      concatMap((event) => {
        const upload$ = defer(() =>
          from(uploadFiles()).pipe(
            mergeMap((imetas) => {
              return mutateAsync({
                ...event,
                tags: [...imetas, ...event.tags],
              })
            }),
            tap(() => resetFiles()),
            map(() => false),
            startWith(0),
            catchError((error) => {
              resetUploadingFiles()
              enqueueToast({ component: error.toString(), duration: 4000 })
              return EMPTY
            }),
          ),
        )
        return concat(countDown$, upload$).pipe(takeUntil(cancel$), endWith(false))
      }),
    )
  }, false)

  return (
    <>
      <EditorContainer open={state.open} onClick={() => state.setOpen()}>
        {pubkey && <UserAvatar pubkey={pubkey} />}
        <Stack horizontal={false} align='stretch' justify={'center'} grow sx={styles.content}>
          <Stack sx={[styles.content, dense && styles.content$dense]} gap={2} align='flex-start'>
            <Stack horizontal={false} sx={styles.wrapper}>
              <EditorHeader />
              {state.open ? (
                <>
                  <EditorTiptap key='editor' dense={dense} />
                  <MediaListEditor />
                  <ButtonBase sx={styles.mediaBox} onClick={() => selectFiles()}>
                    <IconPhotoPlus size={28} strokeWidth={'1.8'} />
                  </ButtonBase>
                </>
              ) : (
                <EditorPlaceholder />
              )}
            </Stack>
          </Stack>
          {state.open && (
            <EditorToolbar renderAddMedia={false}>
              <EditorSubmit
                state={submitState}
                disabled={files.length === 0 || state.isUploading}
                renderDiscard={renderDiscard}
                onSubmit={() => state.event && submit(state.event)}
                onDiscard={() => {
                  resetFiles()
                  onDiscard?.()
                }}
              />
            </EditorToolbar>
          )}
        </Stack>
      </EditorContainer>
      <EditorExpandables />
    </>
  )
})

const styles = css.create({
  content: {
    width: '100%',
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  content$dense: {
    padding: spacing['padding0.5'],
    paddingBlock: 0,
  },
  wrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  mediaBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    height: 110,
    opacity: 0.8,
    cursor: 'pointer',
    border: '1px solid',
    borderStyle: 'dashed',
    borderRadius: shape.xl,
    borderColor: palette.outline,
    transform: 'scale(1)',
    transitionProperty: 'transform',
    transitionDuration: duration.short3,
    transitionTimingFunction: easing.emphasized,
    ':active': {
      transform: 'scale(0.9)',
    },
  },
})

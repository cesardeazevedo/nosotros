import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import {
  filesAtom,
  resetFileUploadAtom,
  resetIsUploadingAtom,
  uploadFilesAtom,
} from '@/atoms/upload.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoPlus } from '@tabler/icons-react'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import { useAtomValue, useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import { useObservableState } from 'observable-hooks'
import { memo, useEffect } from 'react'
import { css } from 'react-strict-dom'
import { catchError, concatMap, EMPTY, from, map, mergeMap, of, startWith } from 'rxjs'
import { MediaListEditor } from '../Media/MediaListEditor'
import { EditorContainer } from './EditorContainer'
import { EditorExpandables } from './EditorExpandables'
import { EditorHeader } from './EditorHeader'
import { EditorPlaceholder } from './EditorPlaceholder'
import type { EditorContextType } from './EditorProvider'
import { EditorSubmit } from './EditorSubmit'
import { EditorTiptap } from './EditorTiptap'
import { EditorToolbar } from './EditorToolbar'
import { useEditorSelector } from './hooks/useEditor'

type Props = {
  initialOpen?: boolean
  renderDiscard?: boolean
  sx?: SxProps
  onDiscard?: () => void
  onSubmit: (editor: EditorContextType) => Promise<NostrEvent>
}

// For kind 20 notes
export const EditorMedia = memo(function EditorMedia(props: Props) {
  const { initialOpen, renderDiscard = true, onDiscard, onSubmit } = props
  const { dense } = useContentContext()
  const files = useAtomValue(filesAtom)
  const uploadFiles = useSetAtom(uploadFilesAtom)
  const resetFiles = useSetAtom(resetFileUploadAtom)
  const resetUploadingFiles = useSetAtom(resetIsUploadingAtom)
  const enqueueToast = useSetAtom(enqueueToastAtom)

  const state = useEditorSelector((editor) => editor)
  const pubkey = useCurrentPubkey()

  useEffect(() => {
    state.toggle('open', initialOpen)
    if (initialOpen && !('ontouchstart' in window)) {
      state.focus()
    }
  }, [initialOpen])

  const [, submit] = useObservableState<boolean, EditorContextType>((input$) => {
    return input$.pipe(
      concatMap((state) => {
        return from(uploadFiles()).pipe(
          mergeMap((imetas) => {
            if (state.event) {
              return onSubmit({
                ...state,
                event: {
                  ...state.event,
                  tags: [...imetas, ...state.event.tags],
                },
              })
            }
            return EMPTY
          }),
          map(() => false),
          startWith(true),
          catchError((error) => {
            resetUploadingFiles()
            enqueueToast({ component: error.toString(), duration: 4000 })
            return of(false)
          }),
        )
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
                  <ButtonBase sx={styles.mediaBox} onClick={() => state.selectFiles()}>
                    <IconPhotoPlus size={28} strokeWidth={'1.8'} />
                  </ButtonBase>
                </>
              ) : (
                <EditorPlaceholder placeholder={state.placeholder} />
              )}
            </Stack>
          </Stack>
          {state.open && (
            <EditorToolbar renderAddMedia={false}>
              <EditorSubmit
                submitting={state.submitting}
                disabled={files.length === 0 || state.submitting || state.isUploading}
                renderDiscard={renderDiscard}
                onSubmit={() => submit(state)}
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

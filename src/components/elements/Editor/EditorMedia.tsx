import { useContentContext } from '@/components/providers/ContentProvider'
import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useCurrentPubkey, useGlobalSettings } from '@/hooks/useRootStore'
import type { EditorStore } from '@/stores/editor/editor.store'
import { UploadStore } from '@/stores/editor/upload.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoPlus } from '@tabler/icons-react'
import { UserAvatar } from 'components/elements/User/UserAvatar'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import { useEffect, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { concat, concatMap, defer, endWith, from, map, mergeMap, startWith, takeUntil, tap } from 'rxjs'
import { MediaListEditor } from '../Media/MediaListEditor'
import { EditorContainer } from './EditorContainer'
import { EditorExpandables } from './EditorExpandables'
import { EditorHeader } from './EditorHeader'
import { EditorPlaceholder } from './EditorPlaceholder'
import { EditorSubmit } from './EditorSubmit'
import { EditorTiptap } from './EditorTiptap'
import { EditorToolbar } from './EditorToolbar'
import { cancel$, countDown$ } from './utils/countDown'

type Props = {
  store: EditorStore
  initialOpen?: boolean
  renderDiscard?: boolean
  sx?: SxProps
  onDiscard?: () => void
}

// For kind 20 notes
export const EditorMedia = observer(function EditorMedia(props: Props) {
  const { store, initialOpen, renderDiscard = true, onDiscard } = props
  const { dense } = useContentContext()
  const globalSettings = useGlobalSettings()

  const pubkey = useCurrentPubkey()

  useEffect(() => {
    store.open.toggle(initialOpen)
  }, [])

  const uploadStore = useMemo(
    () =>
      new UploadStore({
        sign: (event) => store.sign(event),
        defaultUploadType: globalSettings.defaultUploadType as 'nip96' | 'blossom',
        defaultUploadUrl: globalSettings.defaultUploadUrl,
      }),
    [],
  )

  const [submitState, submit] = useObservableState<string | number | boolean, [EditorStore, UploadStore]>((input$) => {
    return input$.pipe(
      concatMap(([store, uploadStore]) => {
        const upload$ = defer(() =>
          from(uploadStore.uploadFiles()).pipe(
            mergeMap((imetas) => {
              return store.submit({
                ...store.rawEvent,
                tags: [...imetas, ...store.rawEvent.tags],
              })
            }),
            tap(() => uploadStore.reset()),
            map(() => false),
            startWith(0),
          ),
        )
        return concat(countDown$, upload$).pipe(takeUntil(cancel$), endWith(false))
      }),
    )
  }, false)

  return (
    <>
      <EditorContainer store={store}>
        <UserAvatar size='md' pubkey={pubkey} />
        <Stack horizontal={false} align='stretch' justify={'center'} grow sx={styles.content}>
          <Stack sx={[styles.content, dense && styles.content$dense]} gap={2} align='flex-start'>
            <Stack horizontal={false} sx={styles.wrapper}>
              <EditorHeader store={store} />
              {store.open.value ? (
                <>
                  <EditorTiptap kind20 key='editor' dense={dense} store={store} placeholder={store.placeholder} />
                  <MediaListEditor uploadStore={uploadStore} />
                  <ButtonBase sx={styles.mediaBox} onClick={() => uploadStore.selectFiles()}>
                    <IconPhotoPlus size={28} strokeWidth={'1.8'} />
                  </ButtonBase>
                </>
              ) : (
                <EditorPlaceholder store={store} />
              )}
            </Stack>
          </Stack>
          {store.open.value && (
            <EditorToolbar renderAddMedia={false} store={store}>
              <EditorSubmit
                store={store}
                state={submitState}
                disabled={uploadStore.files.length === 0 || store.isUploading.value}
                renderDiscard={renderDiscard}
                onSubmit={() => submit([store, uploadStore])}
                onDiscard={() => {
                  uploadStore.reset()
                  onDiscard?.()
                }}
              />
            </EditorToolbar>
          )}
        </Stack>
      </EditorContainer>
      <EditorExpandables store={store} />
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
  },
})

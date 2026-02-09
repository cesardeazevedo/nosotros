import { deleteFileAtIndexAtom, filesAtom, setFileDataAtom, type UploadFile } from '@/atoms/upload.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlus } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import type { ImageAttributes, VideoAttributes } from 'nostr-editor'
import { Fragment, memo } from 'react'
import { css } from 'react-strict-dom'
import { ImageEditor } from '../Content/Image/ImageEditor'
import { MediaGroup, } from '../Content/Layout/MediaGroup'
import type { Props as MediaWrapperProps } from '../Content/Layout/MediaWrapper'
import { VideoEditor } from '../Content/Video/VideoEditor'

type Props = {
  files?: UploadFile[]
  onAddMedia?: () => void
  disableAddMedia?: boolean
}

export const MediaListEditor = memo(function MediaListEditor(props: Props) {
  const { onAddMedia, files: inputFiles, disableAddMedia } = props
  const atomFiles = useAtomValue(filesAtom)
  const files = inputFiles || atomFiles
  const deleteFile = useSetAtom(deleteFileAtIndexAtom)
  const setFileData = useSetAtom(setFileDataAtom)
  const isPair = files.length == 2
  const isMultiple = files.length > 1
  const wrapperProps = {
    mode: (files.length == 1 ? 'single_dense' : isPair ? 'pair' : 'carousel'),
    sx: [styles.wrapper, isMultiple && styles.multiple],
  } satisfies Omit<MediaWrapperProps, 'children' | 'src'>
  return (
    <ContentProvider value={{ dense: true }}>
      <MediaGroup length={files.length}>
        {files.map((file, index) => (
          <Fragment key={file.src}>
            <>
              {/*
                When a filtered files list is passed, map delete to the actual atom index.
              */}
              {file.file.type.startsWith('image') && (
                <ImageEditor
                  {...(file as ImageAttributes)}
                  cover={isMultiple}
                  onDelete={() => {
                    const targetIndex = atomFiles.findIndex((item) => item.src === file.src)
                    if (targetIndex >= 0) {
                      deleteFile(targetIndex)
                    } else {
                      deleteFile(index)
                    }
                  }}
                  wrapperProps={wrapperProps}
                  onUpdate={(attrs) => setFileData({ src: file.src, attrs })}
                />
              )}
              {file.file.type.startsWith('video') && (
                <VideoEditor
                  {...(file as VideoAttributes)}
                  cover={isMultiple}
                  onDelete={() => {
                    const targetIndex = atomFiles.findIndex((item) => item.src === file.src)
                    if (targetIndex >= 0) {
                      deleteFile(targetIndex)
                    } else {
                      deleteFile(index)
                    }
                  }}
                  onUpdate={(attrs) => setFileData({ src: file.src, attrs })}
                  wrapperProps={wrapperProps}
                />
              )}
            </>
          </Fragment>
        ))}
        {!!onAddMedia && (
          <IconButton
            size='md'
            variant='outlined'
            onClick={onAddMedia}
            disabled={disableAddMedia}
            icon={<IconPlus size={20} strokeWidth='1.9' />}
            sx={[styles.addMedia, isMultiple && styles.addMedia$multiple, files.length === 0 && styles.addMedia$empty]}
          />
        )}
      </MediaGroup>
    </ContentProvider>
  )
})

const styles = css.create({
  wrapper: {
    position: 'relative',
    margin: 0,
    width: 'auto',
  },
  multiple: {
    width: '100%',
    height: '100%',
  },
  addMedia: {
    width: 44,
    height: 44,
    marginRight: spacing.margin2,
    borderStyle: 'dashed',
    borderColor: palette.outline,
    borderRadius: shape.lg,
  },
  addMedia$multiple: {
    width: 44,
    height: 44,
    alignSelf: 'center',
    flex: '0 0 auto',
  },
  addMedia$empty: {
    marginRight: 0,
    alignSelf: 'center',
  },
})

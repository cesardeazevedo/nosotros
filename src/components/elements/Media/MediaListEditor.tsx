import { deleteFileAtIndexAtom, filesAtom, setFileDataAtom } from '@/atoms/upload.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { useAtomValue, useSetAtom } from 'jotai'
import type { ImageAttributes, VideoAttributes } from 'nostr-editor'
import { Fragment, memo } from 'react'
import { css } from 'react-strict-dom'
import { ImageEditor } from '../Content/Image/ImageEditor'
import { MediaGroup } from '../Content/Layout/MediaGroup'
import { VideoEditor } from '../Content/Video/VideoEditor'

export const MediaListEditor = memo(function MediaListEditor() {
  const files = useAtomValue(filesAtom)
  const deleteFile = useSetAtom(deleteFileAtIndexAtom)
  const setFileData = useSetAtom(setFileDataAtom)
  const isMultiple = files.length > 1
  const isCarousel = files.length > 2
  const wrapperProps = {
    size: (isCarousel ? 'sm' : 'md') as 'sm' | 'md',
    fixed: isCarousel,
    fixedHeight: isCarousel ? 200 : undefined,
    sx: [styles.wrapper, isMultiple && styles.multiple],
  }
  return (
    <ContentProvider value={{ dense: true }}>
      <MediaGroup length={files.length}>
        {files.map((file, index) => (
          <Fragment key={file.src}>
            <>
              {file.file.type.startsWith('image') && (
                <ImageEditor
                  {...(file as ImageAttributes)}
                  cover={isMultiple}
                  onDelete={() => deleteFile(index)}
                  wrapperProps={wrapperProps}
                  onUpdate={(attrs) => setFileData({ src: file.src, attrs })}
                />
              )}
              {file.file.type.startsWith('video') && (
                <VideoEditor
                  {...(file as VideoAttributes)}
                  cover={isMultiple}
                  onDelete={() => deleteFile(index)}
                  onUpdate={(attrs) => setFileData({ src: file.src, attrs })}
                  wrapperProps={wrapperProps}
                />
              )}
            </>
          </Fragment>
        ))}
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
})

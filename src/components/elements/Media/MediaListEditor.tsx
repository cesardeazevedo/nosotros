import { deleteFileAtIndexAtom, filesAtom, setFileDataAtom } from '@/atoms/upload.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { useAtomValue, useSetAtom } from 'jotai'
import type { ImageAttributes, VideoAttributes } from 'nostr-editor'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { ImageEditor } from '../Content/Image/ImageEditor'
import { MediaGroup } from '../Content/Layout/MediaGroup'
import { MediaWrapper } from '../Content/Layout/MediaWrapper'
import { VideoEditor } from '../Content/Video/VideoEditor'

export const MediaListEditor = memo(function MediaListEditor() {
  const files = useAtomValue(filesAtom)
  const deleteFile = useSetAtom(deleteFileAtIndexAtom)
  const setFileData = useSetAtom(setFileDataAtom)
  const isMultiple = files.length > 1
  const isCarousell = files.length > 2
  return (
    <ContentProvider value={{ dense: true }}>
      <MediaGroup caroussel={files.length > 2}>
        {files.map((file, index) => (
          <MediaWrapper
            key={file.src}
            size={isCarousell ? 'sm' : 'md'}
            src={file.src}
            fixed={isCarousell}
            fixedHeight={isCarousell ? 200 : undefined}
            sx={styles.wrapper}>
            <>
              {file.file.type.startsWith('image') && (
                <ImageEditor
                  {...(file as ImageAttributes)}
                  cover={isMultiple}
                  onDelete={() => deleteFile(index)}
                  onUpdate={(attrs) => setFileData({ src: file.src, attrs })}
                />
              )}
              {file.file.type.startsWith('video') && (
                <VideoEditor
                  {...(file as VideoAttributes)}
                  onDelete={() => deleteFile(index)}
                  onUpdate={(attrs) => setFileData({ src: file.src, attrs })}
                />
              )}
            </>
          </MediaWrapper>
        ))}
      </MediaGroup>
    </ContentProvider>
  )
})

const styles = css.create({
  wrapper: {
    position: 'relative',
    height: '100%',
    margin: 0,
    width: 'fit-content',
  },
})

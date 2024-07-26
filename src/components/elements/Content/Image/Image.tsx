import { Box, styled } from '@mui/material'
import type { SyntheticEvent } from 'react'
import { useCallback, useContext, useRef } from 'react'
import type Note from 'stores/models/note'
import { dialogStore } from 'stores/ui/dialogs.store'
import { settingsStore } from 'stores/ui/settings.store'
import { ContentContext } from '../Content'

type Props = {
  src: string
  note: Note
}

const shouldForwardProp = (prop: string) => prop !== 'dense'

const Img = styled('img', { shouldForwardProp })<{ dense?: boolean }>(({ dense }) => ({
  objectFit: 'cover',
  width: '100%',
  height: '100%',
  maxWidth: dense ? 360 : 400,
  maxHeight: dense ? 400 : 440,
  marginTop: dense ? 6 : 10,
  marginBottom: 10,
  borderRadius: 8,
}))

function Image(props: Props) {
  const { note, src } = props
  const { dense } = useContext(ContentContext)
  const ref = useRef<HTMLImageElement>(null)

  const width = note.meta.imeta?.[src]?.dim?.width
  const height = note.meta.imeta?.[src]?.dim?.height
  // const blurhash = note.imeta?.metadata?.[url]?.blurhash

  const handleClick = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dialogStore.pushImage(src)
    },
    [src],
  )

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
        px: dense ? 0 : 2,
      }}
      onClick={handleClick}>
      {/* Too slow, not worth it */}
      {/* <ImageBlur width={width} height={height} blurhash={blurhash} render={!loaded} /> */}
      <Img
        ref={ref}
        dense={dense}
        src={settingsStore.getImgProxyUrl('feed_img', src)}
        loading='lazy'
        width={width || '100%'}
        height={height || '100%'}
      />
    </Box>
  )
}

export default Image

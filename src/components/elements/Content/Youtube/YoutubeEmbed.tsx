import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { Box } from '@mui/material'
import { useContext, useMemo } from 'react'
import { ContentContext } from '../Content'

type Props = {
  src: string
}

function YoutubeEmbed(props: Props) {
  const { src } = props
  const { dense } = useContext(ContentContext)

  const embedId = useMemo(() => {
    const url = new URL(src)
    const value = url.host === 'youtu.be' ? url.pathname : new URLSearchParams(url.search).get('v')
    return value?.replace(/^\//, '')
  }, [src])

  return (
    <Box sx={{ mt: 1, px: dense ? 0 : 2 }}>
      <style>
        {`
        .lty-playbtn {
          border: none;
          border-radius: 16%;
        }
      `}
      </style>
      {embedId && (
        <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <LiteYouTubeEmbed id={embedId} title='' />
        </Box>
      )}
    </Box>
  )
}

export default YoutubeEmbed

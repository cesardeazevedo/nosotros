import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { Box } from '@mui/material'
import { useMemo } from 'react'

type Props = {
  src: string
  dense?: boolean
}

function YoutubeEmbed(props: Props) {
  const { src, dense = false } = props

  const embedId = useMemo(() => {
    const url = new URL(src)
    const value = url.host === 'youtu.be' ? url.pathname : new URLSearchParams(url.search).get('v')
    return value?.replace(/^\//, '')
  }, [src])

  return (
    <Box sx={{ mt: 1, borderRadius: dense ? 1 : 0, overflow: 'hidden' }}>
      <style>
        {`
        .lty-playbtn {
          border: none;
          border-radius: 16%;
        }
      `}
      </style>
      {embedId && <LiteYouTubeEmbed id={embedId} title='' />}
    </Box>
  )
}

export default YoutubeEmbed

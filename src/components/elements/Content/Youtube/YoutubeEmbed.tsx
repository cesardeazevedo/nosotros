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
      <iframe
        allowFullScreen
        width='100%'
        height='100%'
        src={`https://www.youtube.com/embed/${embedId}`}
        srcDoc={`
          <style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style>
          <div href=https://www.youtube.com/embed/${embedId}?autoplay=1>
            <img src=https://img.youtube.com/vi/${embedId}/hqdefault.jpg>
            <span>▶</span>
          </div>
        `}
        style={{ height: 293, border: 'none' }}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      />
    </Box>
  )
}

export default YoutubeEmbed

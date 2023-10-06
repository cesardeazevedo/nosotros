import { Box, ButtonBase, Link, Paper, Typography } from '@mui/material'
import { IconExternalLink } from '@tabler/icons-react'
import { Row } from 'components/elements/Layouts/Flex'
import { useMemo } from 'react'
import PostTwitterEmbed from './PostTwitterEmbed'
import PostYoutubeEmbbed from './PostYoutubeEmbed'

type Props = {
  dense?: boolean
  href?: string
  content: string
}

// TODO Proper link preview with open-graph
function PostLinkPreview(props: Props) {
  const { href, content, dense = false } = props
  const contentUrl = href || content
  const url = useMemo(() => new URL(contentUrl), [contentUrl])
  return (
    <Box sx={{ px: dense ? 0 : 2, mb: 1 }}>
      {(url.host.includes('youtube.com') || url.host === 'youtu.be') && <PostYoutubeEmbbed url={url} />}
      {url.host === 'twitter.com' && <PostTwitterEmbed url={url} />}
      <Link href={url.href} target='_blank' rel='noopener noreferrer' underline='none'>
        {!/youtube.com|youtu.be|twitter.com/.test(url.host) && (
          <ButtonBase sx={{ width: '100%', textAlign: 'left', borderRadius: 1 }}>
            <Paper variant='outlined' sx={{ p: 2, width: '100%', background: 'transparent' }}>
              <Row sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ mr: 2, wordBreak: 'break-word' }}>
                  <Typography variant='h6'>{url.hostname.replace('www.', '')}</Typography>
                  <Typography variant='subtitle1'>{content}</Typography>
                </Box>
                <IconExternalLink size={20} style={{ minWidth: 20, opacity: 0.6 }} />
              </Row>
            </Paper>
          </ButtonBase>
        )}
      </Link>
    </Box>
  )
}

export default PostLinkPreview

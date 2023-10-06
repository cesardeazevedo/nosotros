import { Box, Skeleton } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'

type Props = {
  contentHeight?: number
}

function PostRepliesLoading(props: Props) {
  const { contentHeight = 80 } = props
  return (
    <Box sx={{ px: 2, pb: 1 }}>
      <Row sx={{ alignItems: 'flex-start' }}>
        <Skeleton variant='circular' sx={{ minWidth: 40, minHeight: 40 }} />
        <Box sx={{ width: '100%', ml: 1 }}>
          <Skeleton animation='wave' variant='rectangular' sx={{ width: 120, height: 16, borderRadius: 1, mt: 1 }} />
          <Skeleton
            animation='wave'
            variant='rectangular'
            sx={{ width: '92%', height: contentHeight, borderRadius: 1, mt: 0.8 }}
          />
        </Box>
      </Row>
    </Box>
  )
}

export default PostRepliesLoading

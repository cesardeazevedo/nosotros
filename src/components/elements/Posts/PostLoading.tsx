import { Box, Skeleton } from '@mui/material'
import { Row } from '../Layouts/Flex'
import PaperContainer from '../Layouts/PaperContainer'

function PostLoading() {
  return (
    <PaperContainer className='loading' sx={{ width: '100%', height: 200 }}>
      <Row>
        <Skeleton animation='wave' variant='circular' sx={{ width: 40, height: 40, m: 2 }} />
        <Box>
          <Skeleton animation='wave' variant='rectangular' sx={{ width: 140, height: 14, borderRadius: 1 }} />
          <Skeleton animation='wave' variant='rectangular' sx={{ width: 80, height: 12, mt: 0.5, borderRadius: 1 }} />
        </Box>
      </Row>
      <Box sx={{ px: 2 }}>
        <Skeleton animation='wave' variant='rectangular' sx={{ mt: 0, width: '100%', height: 110, borderRadius: 1 }} />
      </Box>
    </PaperContainer>
  )
}

export default PostLoading

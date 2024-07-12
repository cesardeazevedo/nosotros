import { Box, Chip, Typography } from '@mui/material'
import { IconServerBolt } from '@tabler/icons-react'
import { Row } from 'components/elements/Layouts/Flex'
import type { UserRelayDB } from 'db/types'
import { useMemo } from 'react'

type Props = {
  userRelay: UserRelayDB
}

function RelayUserChip(props: Props) {
  const { userRelay } = props
  const { type, relay } = userRelay
  const formatted = useMemo(() => new URL(relay), [relay])
  return (
    <Chip
      icon={
        <Box color='success.main' sx={{ display: 'inline-flex' }}>
          <IconServerBolt color='currentColor' size={18} strokeWidth='1.9' />
        </Box>
      }
      label={
        <Row>
          <Typography variant='subtitle1' sx={{ mr: 1 }}>
            {formatted.hostname} ({type})
          </Typography>
        </Row>
      }
      sx={{ mb: 1, flex: 1 }}
    />
  )
}

export default RelayUserChip

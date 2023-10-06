import { Chip, IconButton, Typography } from '@mui/material'
import { IconLogin } from '@tabler/icons-react'
import { Row } from 'components/elements/Layouts/Flex'
import Tooltip from 'components/elements/Layouts/Tooltip'
import { useMemo } from 'react'

type Props = {
  url: string
}

function RelayChip(props: Props) {
  const { url } = props
  const formatted = useMemo(() => new URL(url), [url])
  const isInside = true
  return (
    <Chip
      label={
        <Row>
          <Tooltip arrow title={url}>
            <Typography variant='h6' sx={{ mr: 1 }}>
              {formatted.hostname}
            </Typography>
          </Tooltip>
          {!isInside && (
            <IconButton size='small' sx={{ color: 'warning.light' }}>
              <IconLogin size={22} stroke='inherit' strokeWidth='1.6' style={{ color: 'inherit' }} />
            </IconButton>
          )}
          {/* {isInside && (
            <Tooltip arrow title='Turn off relay' enterDelay={0}>
              <IconButton size='small' sx={{ color: 'text.secondary' }}>
                <IconServerOff size={20} stroke='inherit' strokeWidth='1.5' style={{ color: 'inherit' }} />
              </IconButton>
            </Tooltip>
          )} */}
        </Row>
      }
      sx={{ my: 0.5 }}
      // icon={
      //   isInside ? (
      //     <Box color='success.main' display='inline-flex'>
      //       <IconCircleCheckFilled size={22} style={{ color: 'inherit' }} strokeWidth='1.5' />
      //     </Box>
      //   ) : (
      //     <Box sx={{ color: 'warning.dark' }} display='inline-flex'>
      //       <IconServerBolt size={22} style={{ color: 'inherit' }} strokeWidth='1.5' />
      //     </Box>
      //   )
      // }
    />
  )
}

export default RelayChip

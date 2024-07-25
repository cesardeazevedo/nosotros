import { Chip, Typography } from '@mui/material'
import type { Relay } from 'core/Relay'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Row } from '../Layouts/Flex'
import RelayIcon from './RelayIcon'

type Props = {
  relay: Relay
}

const RelayChip = observer(function RelayChip(props: Props) {
  const { relay } = props
  const formatted = useMemo(() => new URL(relay.url), [relay])
  return (
    <Chip
      icon={
        <RelayIcon url={relay.url} />
      }
      label={
        <Row>
          <Typography variant='subtitle1' sx={{ mr: 1 }}>
            {formatted.hostname}
          </Typography>
        </Row>
      }
      sx={{ mb: 1, flex: 1 }}
    />
  )
})

export default RelayChip

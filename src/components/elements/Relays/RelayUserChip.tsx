import { Chip, Typography } from '@mui/material'
import { Row } from 'components/elements/Layouts/Flex'
import type { UserRelayDB } from 'db/types'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import RelayIcon from './RelayIcon'

type Props = {
  userRelay: UserRelayDB
}

const RelayUserChip = observer(function RelayUserChip(props: Props) {
  const { userRelay } = props
  const { type, relay: url } = userRelay
  const formatted = useMemo(() => new URL(url), [url])
  return (
    <Chip
      icon={
        <RelayIcon url={url} />
      }
      label={
        <Row>
          <Typography variant='subtitle1' sx={{ mr: 1 }}>
            {formatted.hostname} ({type.toUpperCase()})
          </Typography>
        </Row>
      }
      sx={{ mb: 1, flex: 1 }}
    />
  )
})

export default RelayUserChip

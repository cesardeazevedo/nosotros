import { Box, Paper, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Event } from 'nostr-tools'
import ReactJsonView from 'react-json-view'
import { useStore } from 'stores'
import RelayChip from '../../Relays/RelayChip'

type Props = {
  data: Event
}

const PostStatsRelays = observer(function PostStatsRelays(props: Props) {
  const store = useStore()
  const relays = store.nostr.events.get(props.data.id)?.relays || []
  return (
    <>
      <Typography variant='h6'>Relays:</Typography>
      <Paper
        variant='outlined'
        sx={{
          p: 2,
          mb: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          maxHeight: 350,
        }}>
        {relays.map((url) => (
          <RelayChip key={url} url={url} />
        ))}
      </Paper>
    </>
  )
})

const PostJsonEvent = observer(function PostJsonEvent(props: Props) {
  const { data } = props
  return (
    <>
      <Typography variant='h6'>JSON Event</Typography>
      <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <ReactJsonView
          src={data}
          style={{ maxHeight: 400, overflow: 'auto', padding: '8px' }}
          theme='summerfruit'
          displayDataTypes={false}
          enableClipboard={(data) => navigator.clipboard.writeText(JSON.stringify(data.src))}
        />
      </Box>
    </>
  )
})

const PostUserJson = observer(function PostUserJson(props: Props) {
  const { data } = props
  const user = useStore().users.getUserById(data.pubkey)
  return (
    <>
      <Typography variant='h6'>User</Typography>
      <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <ReactJsonView
          src={user || {}}
          style={{ maxHeight: 250, overflow: 'auto', padding: '8px' }}
          theme='summerfruit'
          displayDataTypes={false}
          enableClipboard={(data) => navigator.clipboard.writeText(JSON.stringify(data.src))}
        />
      </Box>
    </>
  )
})

function PostStats(props: Props) {
  const { data } = props
  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      <style>
        {`
            .variable-row {
              white-space: nowrap;
            }
          `}
      </style>
      <PostStatsRelays data={data} />
      <PostJsonEvent data={data} />
      <PostUserJson data={data} />
    </Box>
  )
}

export default PostStats

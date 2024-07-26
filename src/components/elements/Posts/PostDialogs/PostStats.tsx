import { Box, Chip, Paper, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import ReactJsonView from 'react-json-view'
import type Note from 'stores/models/note'

type Props = {
  note: Note
}

const PostStatsRelays = observer(function PostStatsRelays(props: Props) {
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
        {props.note.seenOn.map((url) => (
          <Chip key={url} label={url} sx={{ mb: 1 }} />
        ))}
      </Paper>
    </>
  )
})

const PostJsonEvent = observer(function PostJsonEvent(props: Props) {
  const { note } = props
  return (
    <>
      <Typography variant='h6'>JSON Event</Typography>
      <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <ReactJsonView
          src={JSON.parse(JSON.stringify(note.event))}
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
  const { note } = props
  return (
    <>
      <Typography variant='h6'>User</Typography>
      <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
        {note.user && (
          <ReactJsonView
            src={JSON.parse(JSON.stringify(note.user.meta))}
            collapsed={false}
            style={{ maxHeight: 250, overflow: 'auto', padding: '8px' }}
            theme='summerfruit'
            displayDataTypes={false}
            enableClipboard={(data) => navigator.clipboard.writeText(JSON.stringify(data.src))}
          />
        )}
      </Box>
    </>
  )
})

function PostStats(props: Props) {
  const { note } = props
  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
      <style>
        {`
            .variable-row {
              white-space: nowrap;
            }
          `}
      </style>
      <PostStatsRelays note={note} />
      <PostJsonEvent note={note} />
      <PostUserJson note={note} />
    </Box>
  )
}

export default PostStats

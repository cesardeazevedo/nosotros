import { Typography } from '@mui/material'
import { IconAlertCircle } from '@tabler/icons-react'

type Props = {
  kind: number
}

function PostError(props: Props) {
  const { kind } = props
  return (
    <Typography
      variant='subtitle2'
      color='text.secondary'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        px: 3,
      }}>
      <IconAlertCircle size={30} strokeWidth='1.4' style={{ marginBottom: 12 }} />
      {`Can't display content of kind ${kind}`}
    </Typography>
  )
}

export default PostError

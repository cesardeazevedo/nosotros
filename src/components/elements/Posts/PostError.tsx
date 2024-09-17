import { Text } from '@/components/ui/Text/Text'
import { IconAlertCircle } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

type Props = {
  kind: number
}

function PostError(props: Props) {
  const { kind } = props
  return (
    <Text size='lg' sx={styles.root}>
      <IconAlertCircle size={30} strokeWidth='1.4' style={{ marginBottom: 12 }} />
      {`Can't display content of kind ${kind}`}
    </Text>
  )
}

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    py: 2,
    px: 3,
  },
})

export default PostError

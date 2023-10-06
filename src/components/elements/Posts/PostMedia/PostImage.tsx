import { styled } from '@mui/material/styles'
import { SimpleImg } from 'react-simple-img'
import { useStore } from 'stores'

type Props = {
  dense?: boolean
  content: string
}

const shouldForwardProp = (prop: string) => prop !== 'dense'

const Image = styled(SimpleImg, { shouldForwardProp })<{ dense?: boolean }>(({ dense = false, theme }) => ({
  img: {
    objectFit: 'cover',
    maxHeight: dense ? 400 : 520,
    maxWidth: dense ? 480 : 600,
    borderRadius: dense ? theme.shape.borderRadius : 0,
  },
}))

function PostImage(props: Props) {
  const store = useStore()
  return (
    <span onClick={() => store.dialogs.pushImage(props.content)}>
      <Image
        importance='auto'
        src={props.content}
        dense={props.dense}
        width={'100%'}
        height={'100%'}
        animationDuration={0.1}
      />
    </span>
  )
}

export default PostImage

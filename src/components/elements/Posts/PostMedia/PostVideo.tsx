import { useMemo } from 'react'

type Props = {
  dense?: boolean
  content: string
}

function PostVideo(props: Props) {
  const extension = useMemo(() => new URL(props.content).pathname.split('.').pop(), [props.content])
  return (
    <video controls style={{ width: '100%', maxHeight: 600, backgroundColor: '#000' }}>
      <source src={props.content} type={`video/${extension === 'mov' ? 'quicktime' : extension}`} />
    </video>
  )
}

export default PostVideo

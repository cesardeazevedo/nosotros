import { useState } from 'react'

type Props = {
  content: string
}

function PostImageDialog(props: Props) {
  const [content] = useState(props.content)
  return (
    <>
      <img src={content} style={{ maxHeight: '90vh', objectFit: 'contain' }} />
    </>
  )
}

export default PostImageDialog

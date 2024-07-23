import { useContext, useMemo } from 'react'
import { ContentContext } from '../Content'

export type Props = {
  src: string
}

export default function Video(props: Props) {
  const { src } = props
  const { dense } = useContext(ContentContext)
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])

  return (
    <video
      controls
      autoPlay={false}
      preload='metadata'
      style={{
        marginLeft: dense ? 0 : 16,
        marginRight: dense ? 0 : 16,
        borderRadius: 8,
        width: 'fit-content',
        maxWidth: 500,
        maxHeight: 450,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#000',
      }}>
      <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
    </video>
  )
}

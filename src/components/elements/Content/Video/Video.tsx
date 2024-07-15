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
      preload='metadata'
      style={{
        width: '100%',
        maxHeight: 600,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#000',
        borderRadius: dense ? 4 : 0,
      }}>
      <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
    </video>
  )
}

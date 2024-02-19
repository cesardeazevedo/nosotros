import { useMemo } from 'react'

export type Props = {
  dense?: boolean
  src: string
}

export default function Video(props: Props) {
  const { src } = props
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  return (
    <video
      controls
      style={{
        width: '100%',
        maxHeight: 600,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#000',
        borderRadius: props.dense ? 4 : 0,
      }}>
      <source src={src} type={`video/${extension === 'mov' ? 'quicktime' : extension}`} />
    </video>
  )
}

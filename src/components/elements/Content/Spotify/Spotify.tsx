import { css } from 'react-strict-dom'

export type Props = {
  src: string
}

export const Spotify = (props: Props) => {
  const { src } = props
  return (
    <iframe
      src={src}
      width='100%'
      height='352'
      allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
      loading='lazy'
      style={styles.iframe}
    />
  )
}

const styles = css.create({
  iframe: {
    border: 'none',
    borderRadius: 12,
  },
})

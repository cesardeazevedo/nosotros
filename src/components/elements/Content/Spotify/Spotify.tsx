import { useContentContext } from '@/components/providers/ContentProvider'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  src: string
}

export const Spotify = (props: Props) => {
  const { src } = props
  const { dense } = useContentContext()
  
  // Convert Spotify URL to embed URL
  const embedUrl = src.replace('open.spotify.com', 'open.spotify.com/embed')
  
  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      <iframe
        src={embedUrl}
        width="100%"
        height="352"
        frameBorder="0"
        allowTransparency
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={styles.iframe as any}
      />
    </html.div>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
  },
  root$dense: {
    paddingInline: 0,
  },
  iframe: {
    borderRadius: 12,
  },
})
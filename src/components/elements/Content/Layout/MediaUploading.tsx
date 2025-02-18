import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { shape } from '@/themes/shape.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
  uploading: boolean
}

export const MediaUploading = (props: Props) => {
  const { children, uploading = true } = props
  if (!uploading) {
    return children
  }
  return (
    <>
      <html.div style={styles.root}>
        <html.div style={styles.scrim}>
          <CircularProgress size='sm' />
        </html.div>
        {children}
      </html.div>
    </>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    width: 'fit-content',
    height: 'fit-content',
    zIndex: 1000,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: shape.lg,
  },
})

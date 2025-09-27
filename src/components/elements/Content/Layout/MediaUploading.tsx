import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import React from 'react'
import { MediaScrim } from './MediaScrim'

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
      <MediaScrim>
        <CircularProgress size='sm' />
      </MediaScrim>
      {children}
    </>
  )
}

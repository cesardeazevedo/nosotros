import { Camera } from '@/components/elements/Camera/Camera'
import { DialogSheet } from '@/components/elements/Layouts/Dialog'
import { useDialogControl } from '@/hooks/useDialogs'
import { memo } from 'react'

export const CameraDialog = memo(function CameraDialog() {
  const [open, onClose] = useDialogControl('camera')

  return (
    <DialogSheet maxWidth='xs' open={open} onClose={onClose}>
      <Camera />
    </DialogSheet>
  )
})

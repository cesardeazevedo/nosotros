import { filesAtom, selectFilesForUploadAtom, setUploadDialogConfigAtom, uploadDialogConfigAtom } from '@/atoms/upload.atoms'
import { DialogSheet } from '@/components/elements/Layouts/Dialog'
import { UploadServersMenuList } from '@/components/elements/Upload/UploadServersMenuList'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconX } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { css } from 'react-strict-dom'
import { MediaCompression } from '../Content/Layout/MediaCompression'
import { MediaListEditor } from '../Media/MediaListEditor'

type Props = {
  open: boolean
  uploading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export const EditorUploadDialog = (props: Props) => {
  const { open, uploading, onClose, onConfirm } = props
  const files = useAtomValue(filesAtom)
  const pendingFiles = files.filter((item) => !item.sha256)
  const uploadConfig = useAtomValue(uploadDialogConfigAtom)
  const setUploadConfig = useSetAtom(setUploadDialogConfigAtom)
  const selectFiles = useSetAtom(selectFilesForUploadAtom)
  const hasVideo = pendingFiles.some((item) => item.file.type.startsWith('video/'))
  const uploadUrlLabel = (() => {
    try {
      return new URL(uploadConfig.uploadUrl).hostname
    } catch {
      return uploadConfig.uploadUrl
    }
  })()

  return (
    <DialogSheet open={open} onClose={onClose} maxWidth={pendingFiles.length > 1 ? 'lg' : 'md'} sx={styles.dialog}>
      <Stack horizontal={false} gap={0} sx={styles.root}>
        <Stack sx={styles.header} justify='space-between' align='center'>
          <IconButton
            size='md'
            onClick={onClose}
            icon={<IconX size={24} />}
            aria-label='Close'
          />
          <Text variant='title' size='lg'>
            Upload Media
          </Text>
          <Button variant='filled' onClick={onConfirm} disabled={Boolean(uploading) || pendingFiles.length === 0}>
            {uploading ? 'Uploading' : 'Upload'}
          </Button>
        </Stack>
        <Divider />
        <Stack align='stretch'>
          <Stack grow sx={styles.mediaColumn}>
            <Stack sx={styles.files}>
              <MediaListEditor files={pendingFiles} onAddMedia={() => selectFiles()} disableAddMedia={Boolean(uploading)} />
            </Stack>
          </Stack>
          <Divider orientation='vertical' />
          <Stack horizontal={false} gap={3} sx={styles.options} align='flex-start'>
            <Text variant='title' size='lg'>
              Upload Options
            </Text>
            <Text variant='label' size='lg'>
              Upload Server
            </Text>
            <Popover
              placement='bottom-end'
              contentRenderer={({ close }) => (
                <UploadServersMenuList
                  onSelect={(uploadType, uploadUrl) => {
                    setUploadConfig({ uploadType, uploadUrl })
                    close()
                  }}
                  onClose={close}
                />
              )}>
              {({ getProps, setRef, open }) => (
                <Chip
                  elevated
                  variant='input'
                  label={uploadUrlLabel}
                  icon={<IconChevronDown color='currentColor' size={18} strokeWidth='2' />}
                  onClick={open}
                  ref={setRef}
                  {...getProps()}
                />
              )}
            </Popover>
            <MediaCompression
              quality={uploadConfig.quality}
              includeAudio={uploadConfig.includeAudio}
              onToggleAudio={hasVideo ? () => setUploadConfig({ includeAudio: !uploadConfig.includeAudio }) : undefined}
              onQualityChange={(quality) => setUploadConfig({ quality })}
            />
          </Stack>
        </Stack>
      </Stack>
    </DialogSheet>
  )
}

const styles = css.create({
  dialog: {
    padding: spacing.padding3,
  },
  root: {
    width: '100%',
  },
  header: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  body: {
    paddingTop: spacing.padding2,
  },
  options: {
    flex: 1,
    width: 300,
    maxWidth: 300,
    minWidth: 300,
    padding: spacing.padding3,
  },
  mediaColumn: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  files: {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    padding: spacing.padding3,
  },
})

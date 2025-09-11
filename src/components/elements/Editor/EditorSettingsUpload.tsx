import { Chip } from '@/components/ui/Chip/Chip'
import { Popover } from '@/components/ui/Popover/Popover'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useSetSettings, useSettings } from '@/hooks/useSettings'
import { IconBug, IconChevronDown } from '@tabler/icons-react'
import { memo, useMemo } from 'react'
import { UploadServersMenuList } from '../Upload/UploadServersMenuList'

export const EditorSettingsUpload = memo(function EditorSettingsUpload() {
  const settings = useSettings()
  const setSettings = useSetSettings()
  const selectedUrl = settings.defaultUploadUrl

  const [url, error] = useMemo(() => {
    try {
      const url = new URL(selectedUrl)
      return [url.hostname, false]
    } catch (err) {
      const error = err as Error
      return [selectedUrl, error.message]
    }
  }, [selectedUrl])

  return (
    <Popover
      placement='bottom-end'
      contentRenderer={({ close }) => (
        <UploadServersMenuList
          onSelect={(uploadType, uploadUrl) => {
            close()
            setSettings({ defaultUploadType: uploadType })
            setSettings({ defaultUploadUrl: uploadUrl })
          }}
          onClose={close}
        />
      )}>
      {({ getProps, setRef, open }) => (
        <Chip
          elevated
          variant='input'
          label={url}
          icon={<IconChevronDown color='currentColor' size={18} strokeWidth='2' />}
          trailingIcon={
            error && (
              <Tooltip text={error}>
                <IconBug color='red' size={20} strokeWidth={'1.5'} />
              </Tooltip>
            )
          }
          onClick={open}
          ref={setRef}
          {...getProps()}
        />
      )}
    </Popover>
  )
})

import { Chip } from '@/components/ui/Chip/Chip'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useUserBlossomServers } from '@/hooks/query/useQueryUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useSetSettings, useSettings } from '@/hooks/useSettings'
import { spacing } from '@/themes/spacing.stylex'
import { IconBug, IconChevronDown } from '@tabler/icons-react'
import { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { useEditorSelector } from './hooks/useEditor'

const nip96urls = ['nostr.build', 'nostrcheck.me', 'nostrage.com']

export const EditorSettingsUpload = memo(function EditorSettingsUpload() {
  const editor = useEditorSelector((editor) => editor.editor)
  const pubkey = useCurrentPubkey()
  const blossomServerList = useUserBlossomServers(pubkey)
  const settings = useSettings()
  const setSettings = useSetSettings()
  const selectedUrl = settings.defaultUploadUrl

  const onUpdate = (uploadType: string, uploadUrl: string) => {
    setSettings({ defaultUploadType: uploadType })
    setSettings({ defaultUploadUrl: uploadUrl })
    // Update existing images
    if (editor) {
      const tr = editor.state.tr
      editor.state.doc.descendants((node, pos) => {
        if (['image', 'video'].includes(node.type.name) && !node.attrs.uploading) {
          tr.setNodeAttribute(pos, 'uploadType', uploadType)
          tr.setNodeAttribute(pos, 'uploadUrl', uploadUrl)
        }
      })
      editor.view.dispatch(tr)
    }
  }

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
        <MenuList surface='surfaceContainerLowest'>
          {blossomServerList.data && (
            <>
              <Stack sx={styles.subheader}>
                <Text>Blossom Servers</Text>
              </Stack>
              {blossomServerList.data.map((url) => {
                let formatted
                try {
                  formatted = new URL(url)
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                  formatted = { host: url }
                }
                return (
                  <MenuItem
                    interactive
                    key={url}
                    label={formatted.host}
                    onClick={() => {
                      onUpdate('blossom', url)
                      close()
                    }}
                  />
                )
              })}
            </>
          )}
          <Stack sx={styles.subheader}>
            <Text>NIP-96</Text>
          </Stack>
          {nip96urls.map((url) => (
            <MenuItem
              interactive
              key={url}
              label={url}
              onClick={() => {
                onUpdate('nip96', 'https://' + url)
                close()
              }}
            />
          ))}
        </MenuList>
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

const styles = css.create({
  subheader: {
    paddingLeft: spacing.padding2,
  },
})

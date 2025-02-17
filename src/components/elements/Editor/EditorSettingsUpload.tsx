import { Chip } from '@/components/ui/Chip/Chip'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey, useGlobalSettings } from '@/hooks/useRootStore'
import { blossomStore } from '@/stores/blossom/blossom.store'
import type { EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  store: EditorStore
}

const nip96urls = ['nostr.build', 'nostrcheck.me', 'nostrage.com']

export const EditorSettingsUpload = observer(function EditorSettingsUpload(props: Props) {
  const { store } = props
  const globalSettings = useGlobalSettings()
  const selectedUrl = globalSettings.defaultUploadUrl

  const onUpdate = (uploadType: string, uploadUrl: string) => {
    const { editor } = store
    globalSettings.set('defaultUploadType', uploadType)
    globalSettings.set('defaultUploadUrl', uploadUrl)
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

  const pubkey = useCurrentPubkey()
  const url = useMemo(() => new URL(selectedUrl), [selectedUrl])
  const blossomServers = blossomStore.list(pubkey || '')
  return (
    <Popover
      placement='bottom'
      contentRenderer={({ close }) => (
        <MenuList>
          {blossomServers && (
            <>
              <Stack sx={styles.subheader}>
                <Text>Blossom Servers</Text>
              </Stack>
              {blossomServers.map((url) => {
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
          label={url.hostname}
          icon={<IconChevronDown color='currentColor' size={18} strokeWidth='2' />}
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

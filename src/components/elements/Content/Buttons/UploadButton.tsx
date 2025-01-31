import { Chip } from '@/components/ui/Chip/Chip'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconFileAlert } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/core'
import type { ImageAttributes, VideoAttributes } from 'nostr-editor'
import { useMemo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  node: NodeViewProps
}

const nip96urls = ['nostr.build', 'nostrcheck.me', 'nostrage.com']

export const UploadButton = (props: Props) => {
  const { sha256, uploading, uploadUrl, uploadError } = props.node.node.attrs as ImageAttributes | VideoAttributes
  const uploaded = !!sha256
  const url = useMemo(() => new URL(uploadUrl), [uploadUrl])
  return (
    <html.div style={styles.root}>
      <Popover
        placement='bottom'
        contentRenderer={({ close }) => (
          <MenuList>
            {nip96urls.map((url) => (
              <MenuItem
                interactive
                key={url}
                label={url}
                onClick={() => {
                  props.node.updateAttributes({ uploadUrl: 'https://' + url })
                  close()
                }}
              />
            ))}
          </MenuList>
        )}>
        {({ getProps, setRef, open }) => (
          <Chip
            elevated
            variant='filter'
            selected={uploaded}
            loading={uploading}
            sx={styles.chip}
            label={uploading || uploaded ? '' : url.hostname}
            icon={<IconChevronDown color='currentColor' size={18} strokeWidth='2' />}
            onClick={open}
            trailingIcon={
              uploadError && (
                <Tooltip enterDelay={0} text={uploadError}>
                  <IconFileAlert color='red' size={16} strokeWidth='1.5' />
                </Tooltip>
              )
            }
            ref={setRef}
            {...getProps()}
          />
        )}
      </Popover>
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'absolute',
    right: 8,
    bottom: 6,
  },
  description: {
    paddingInline: spacing.padding2,
  },
  chip: {
    [chipTokens.flatContainerColor]: 'rgba(0, 0, 0, 0.8)',
    [chipTokens.selectedFlatContainerColor]: 'rgba(0, 0, 0, 0.8)',
    [chipTokens.labelTextColor]: 'white',
    [chipTokens.iconColor]: 'white',
    [chipTokens.containerShape]: shape.full,
  },
})

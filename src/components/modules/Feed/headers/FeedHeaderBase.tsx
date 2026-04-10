import type { Props as HeaderBaseProps } from '@/components/elements/Layouts/HeaderBase'
import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { Anchored } from '@/components/ui/Anchored/Anchored'
import { Badge } from '@/components/ui/Badge/Badge'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconAdjustments, IconTrash } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import type { Props as FeedSettingsProps } from '../FeedSettings'
import { FeedSettings } from '../FeedSettings'

type Props = HeaderBaseProps &
  Partial<FeedSettingsProps> & {
    feed?: FeedState
    customSettings?: ReactNode | (({ close }: { close: () => void }) => ReactNode)
    onDelete?: () => void
    renderSetting?: boolean
  }

export const FeedHeaderBase = memo(function FeedHeaderBase(props: Props) {
  const { feed, customSettings, renderRelaySettings, onDelete, renderSetting = true, ...rest } = props

  const handleDelete = () => {
  }
  return (
    <>
      <HeaderBase {...rest} sx={[rest.sx, visibleOnHoverStyle.root]}>
        {(onDelete) && (
          <IconButton sx={visibleOnHoverStyle.item} onClick={onDelete || handleDelete}>
            <IconTrash size={22} strokeWidth='1.5' color={colors.red8} />
          </IconButton>
        )}
        {feed && renderSetting && (
          <Popover
            placement='bottom-end'
            contentRenderer={({ close }) => (
              <Paper outlined elevation={2} surface='surfaceContainerLow' sx={styles.popover}>
                {(typeof customSettings === 'function' ? customSettings({ close }) : customSettings) || (
                  <FeedSettings feed={feed} renderRelaySettings={renderRelaySettings} onClose={close} />
                )}
              </Paper>
            )}>
            {({ getProps, open, opened, setRef }) => (
              <IconButton ref={setRef} selected={opened} onClick={open} {...getProps()}>
                <Anchored content={feed.isDirty && <Badge dot />}>
                  <Stack gap={0.5}>
                    <IconAdjustments size={18} strokeWidth='1.5' />
                  </Stack>
                </Anchored>
              </IconButton>
            )}
          </Popover>
        )}
      </HeaderBase>
    </>
  )
})

const styles = css.create({
  popover: {
    minWidth: 280,
  },
  footer: {
    padding: spacing.padding1,
  },
})

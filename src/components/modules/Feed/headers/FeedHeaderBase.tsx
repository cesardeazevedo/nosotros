import { IconExpandable } from '@/components/elements/Icons/IconExpandable'
import type { Props as HeaderBaseProps } from '@/components/elements/Layouts/HeaderBase'
import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconTrash } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { memo, useState } from 'react'
import { css } from 'react-strict-dom'
import { useDeckColumn, useRemoveDeckColumn } from '../../Deck/hooks/useDeck'
import type { Props as FeedSettingsProps } from '../FeedSettings'
import { FeedSettings } from '../FeedSettings'

type Props = HeaderBaseProps &
  Partial<FeedSettingsProps> & {
    feed?: FeedState
    customSettings?: ReactNode
    onDelete?: () => void
    renderSetting?: boolean
  }

export const FeedHeaderBase = memo(function FeedHeaderBase(props: Props) {
  const [expanded, setExpanded] = useState(false)
  const { feed, customSettings, renderRelaySettings, onDelete, renderSetting = true, ...rest } = props
  const column = useDeckColumn()
  const isDeck = !!column
  const removeDeckColumn = useRemoveDeckColumn(column?.id)

  const handleDelete = () => {
    removeDeckColumn()
  }
  return (
    <>
      <HeaderBase {...rest} sx={[rest.sx, visibleOnHoverStyle.root]}>
        <Stack gap={1}>
          {(isDeck || onDelete) && (
            <IconButton sx={visibleOnHoverStyle.item} onClick={onDelete || handleDelete}>
              <IconTrash size={22} strokeWidth='1.5' color={colors.red8} />
            </IconButton>
          )}
          {feed && (
            <Button variant='filledTonal' onClick={() => setExpanded((prev) => !prev)}>
              <Stack gap={0.5}>
                <IconExpandable upwards strokeWidth='2.5' expanded={expanded} />
                Feed Settings
              </Stack>
            </Button>
          )}
        </Stack>
      </HeaderBase>
      <Expandable expanded={expanded}>
        {feed &&
          renderSetting &&
          (customSettings || <FeedSettings feed={feed} renderRelaySettings={renderRelaySettings} />)}
        {isDeck && (
          <>
            <Divider />
            <Stack sx={styles.footer}>
              <Button variant='danger' onClick={handleDelete}>
                Delete column
              </Button>
            </Stack>
          </>
        )}
      </Expandable>
    </>
  )
})

const styles = css.create({
  footer: {
    padding: spacing.padding1,
  },
})

import { IconExpandable } from '@/components/elements/Icons/IconExpandable'
import type { Props as HeaderBaseProps } from '@/components/elements/Layouts/HeaderBase'
import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useRootStore } from '@/hooks/useRootStore'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconTrash } from '@tabler/icons-react'
import type { ReactNode } from '@tanstack/react-router'
import { useContext, useState } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../../Deck/DeckContext'
import type { Props as FeedSettingsProps } from '../FeedSettings'
import { FeedSettings } from '../FeedSettings'

type Props = HeaderBaseProps &
  Partial<FeedSettingsProps> & {
    feed?: FeedStore
    customSettings?: ReactNode
    onDelete?: () => void
  }

export const FeedHeaderBase = (props: Props) => {
  const [expanded, setExpanded] = useState(false)
  const { feed, customSettings, renderRelaySettings, onDelete, ...rest } = props
  const root = useRootStore()
  const deckModule = useContext(DeckContext).module
  const isDeck = !!deckModule
  const handleDelete = () => {
    if (deckModule) {
      root.decks.selected.delete(deckModule.id)
    }
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
        {feed && (customSettings || <FeedSettings feed={feed} renderRelaySettings={renderRelaySettings} />)}
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
}

const styles = css.create({
  footer: {
    padding: spacing.padding1,
  },
})

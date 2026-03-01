import { LinkRelayFeed } from '@/components/elements/Links/LinkRelayFeed'
import { RelayIcon } from '@/components/elements/Relays/RelayIcon'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import { useRelayFavorites } from '@/hooks/state/useRelayFavorites'
import { IconChevronDown } from '@tabler/icons-react'
import { memo, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  limit?: number
  sx?: SxProps
  allowDeckLink?: boolean
  onSelect?: (relay: string) => void
}

export const RelayFavoritesList = memo(function RelayFavoritesList(props: Props) {
  const { limit, sx, allowDeckLink = true, onSelect } = props
  const favorites = useRelayFavorites()
  const [expanded, setExpanded] = useState(false)

  const items = limit && !expanded ? favorites.slice(0, limit) : favorites
  const canShowMore = limit !== undefined && !expanded && favorites.length > limit

  return (
    <Stack horizontal={false} gap={0.5} sx={sx}>
      {items.map((relay) => (
        <LinkRelayFeed key={relay} url={relay} allowDeckLink={allowDeckLink} onClick={() => onSelect?.(relay)}>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              label={prettyRelayUrl(relay)}
              leadingIcon={<RelayIcon size='sm' url={relay} />}
              sx={styles.menuItem}
            />
          )}
        </LinkRelayFeed>
      ))}
      {canShowMore && (
        <MenuItem
          interactive
          label='Show more'
          leadingIcon={<IconChevronDown size={20} />}
          onClick={() => setExpanded(true)}
        />
      )}
    </Stack>
  )
})

const styles = css.create({
  menuItem: {
    maxWidth: 290,
  },
})

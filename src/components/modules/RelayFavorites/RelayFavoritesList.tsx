import { LinkRelayFeed } from '@/components/elements/Links/LinkRelayFeed'
import { RelayIcon } from '@/components/elements/Relays/RelayIcon'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import { useRelayFavorites } from '@/hooks/state/useRelayFavorites'
import { IconChevronDown } from '@tabler/icons-react'
import { memo, useState } from 'react'

type Props = {
  limit?: number
  sx?: SxProps
  allowDeckLink?: boolean
}

export const RelayFavoritesList = memo(function RelayFavoritesList(props: Props) {
  const { limit, sx, allowDeckLink = true } = props
  const favorites = useRelayFavorites()
  const [expanded, setExpanded] = useState(false)

  const items = limit && !expanded ? favorites.slice(0, limit) : favorites
  const canShowMore = limit !== undefined && !expanded && favorites.length > limit

  return (
    <Stack horizontal={false} gap={0.5} sx={sx}>
      {items.map((relay) => (
        <LinkRelayFeed key={relay} url={relay} allowDeckLink={allowDeckLink}>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              label={prettyRelayUrl(relay)}
              leadingIcon={<RelayIcon size='sm' url={relay} />}
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

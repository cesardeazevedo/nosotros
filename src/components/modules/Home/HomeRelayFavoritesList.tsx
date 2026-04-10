import { LinkRelayFeed } from '@/components/elements/Links/LinkRelayFeed'
import { RelayIcon } from '@/components/elements/Relays/RelayIcon'
import { FeedOverview } from '@/components/modules/Feed/FeedOverview'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { FeedState } from '@/hooks/state/useFeed'
import { useRelayFavorites } from '@/hooks/state/useRelayFavorites'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { atom, useAtom } from 'jotai'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey?: string
  feed: FeedState
}

const expandedRelayFavoritesAtom = atom<Record<string, boolean>>({})

export const HomeRelayFavoritesList = (props: Props) => {
  const { pubkey, feed } = props
  const favorites = useRelayFavorites(pubkey)
  const [expandedRows, setExpandedRows] = useAtom(expandedRelayFavoritesAtom)

  return (
    <Stack horizontal={false} gap={0.5}>
      {favorites.map((relay) => {
        const isActive = feed.options.type === 'relayfeed' && feed.options.ctx?.relays?.[0] === relay

        if (isActive) {
          return (
            <Expandable
              key={relay}
              expanded={expandedRows[relay] ?? true}
              onChange={(expanded) => setExpandedRows((current) => ({ ...current, [relay]: expanded }))}
              trigger={({ expanded, expand }) => (
                <html.div onClick={() => expand()}>
                  <MenuItem
                    interactive
                    selected
                    leading={
                      <html.span style={styles.leading}>
                        {expanded ? (
                          <html.span style={styles.chevron}>
                            <IconChevronDown size={18} strokeWidth='1.8' />
                          </html.span>
                        ) : (
                          <html.span style={styles.chevron}>
                            <IconChevronRight size={18} strokeWidth='1.8' />
                          </html.span>
                        )}
                        <RelayIcon size='sm' url={relay} />
                      </html.span>
                    }
                    label={prettyRelayUrl(relay)}
                  />
                </html.div>
              )}>
              <html.div style={styles.overview}>
                <FeedOverview feed={feed} />
              </html.div>
            </Expandable>
          )
        }

        return (
          <LinkRelayFeed key={relay} url={relay} allowDeckLink={false}>
            {({ isActive }) => (
              <MenuItem
                interactive
                selected={isActive}
                label={prettyRelayUrl(relay)}
                leading={
                  <html.span style={styles.leading}>
                    <html.span style={styles.chevron}>
                      <IconChevronRight size={18} strokeWidth='1.8' />
                    </html.span>
                    <RelayIcon size='sm' url={relay} />
                  </html.span>
                }
              />
            )}
          </LinkRelayFeed>
        )
      })}
    </Stack>
  )
}

const styles = css.create({
  leading: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing['padding0.5'],
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    minWidth: 18,
  },
  overview: {
    paddingLeft: spacing.padding2,
  },
})

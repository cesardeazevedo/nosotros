import { Stack } from '@/components/ui/Stack/Stack'
import { useSearchFeed } from '@/hooks/state/useSearchFeed'
import { useResetScroll } from '@/hooks/useResetScroll'
import { isNamecoinIdentifier, resolveNamecoin } from '@/services/namecoin'
import { searchRoute } from '@/Router'
import { spacing } from '@/themes/spacing.stylex'
import { useNavigate } from '@tanstack/react-router'
import { nip19 } from 'nostr-tools'
import { memo, useEffect } from 'react'
import { css } from 'react-strict-dom'
import { FeedRoute } from '../Feed/FeedRoute'
import { SearchHeader } from './SearchHeader'
import { SearchSettings } from './SearchSettings'

export const SearchRoute = memo(function SearchRoute() {
  useResetScroll()
  const { q } = searchRoute.useSearch()
  const navigate = useNavigate()
  const feed = useSearchFeed(q)

  // Resolve Namecoin identifiers and redirect to user profile
  useEffect(() => {
    if (!q || !isNamecoinIdentifier(q)) return
    let cancelled = false
    resolveNamecoin(q).then((result) => {
      if (cancelled || !result?.pubkey) return
      const nostr = nip19.nprofileEncode({ pubkey: result.pubkey, relays: result.relays?.slice(0, 4) })
      navigate({ to: '/$nostr', params: { nostr }, replace: true })
    })
    return () => { cancelled = true }
  }, [q, navigate])
  return (
    <FeedRoute
      feed={feed}
      renderEditor={false}
      header={
        <>
          <Stack sx={styles.header} horizontal={false} justify='stretch'>
            <SearchHeader
              feed={feed}
              onSubmit={(q) => {
                navigate({ to: '/search', search: { q } })
              }}
            />
          </Stack>
          <SearchSettings feed={feed} />
        </>
      }
    />
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
})

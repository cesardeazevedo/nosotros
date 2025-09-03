import { Kind } from '@/constants/kinds'
import { createListModule } from '@/hooks/modules/createListModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useLG, useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { Feed } from '../../Feed/Feed'
import { StarterPackCard } from './StarterPackCard'

type Props = {
  dense?: boolean
}

export const StarterPackList = memo(function StarterPackList(props: Props) {
  const { dense } = props
  const isLG = useLG()
  const isMobile = useMobile()
  const pubkey = useCurrentPubkey()
  const feed = useFeedState(createListModule(Kind.StarterPack, pubkey))
  return (
    <Feed
      wrapper={(children) => (
        <html.div style={[styles.root, isLG && styles.root$lg, (dense || isMobile) && styles.root$dense]}>
          {children}
        </html.div>
      )}
      feed={feed}
      render={(event) => <StarterPackCard event={event} />}
    />
  )
})

const styles = css.create({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 3fr))',
    padding: spacing.padding1,
  },
  root$lg: {
    gridTemplateColumns: 'repeat(2, minmax(0, 3fr))',
  },
  root$dense: {
    gridTemplateColumns: 'repeat(1, minmax(0, 3fr))',
  },
})

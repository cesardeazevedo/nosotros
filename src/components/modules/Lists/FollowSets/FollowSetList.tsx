import { Kind } from '@/constants/kinds'
import { createListModule } from '@/hooks/modules/createListModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { Feed } from '../../Feed/Feed'
import { FollowSetItem } from './FollowSetItem'

type Props = {
  column?: boolean
  dense?: boolean
}

export const FollowSetList = memo(function FollowSetList(props: Props) {
  const { column = false, dense } = props
  const pubkey = useCurrentPubkey()
  const feed = useFeedState(createListModule(Kind.FollowSets, pubkey))
  return (
    <Feed
      column={column}
      wrapper={(children) => <html.div style={[styles.root, dense && styles.root$dense]}>{children}</html.div>}
      feed={feed}
      render={(event) => <FollowSetItem event={event} sx={dense && styles.item$dense} />}
    />
  )
})

const styles = css.create({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  root$dense: {
    gridTemplateColumns: 'repeat(1, minmax(0, 3fr))',
  },
  item$dense: {
    borderLeft: 0,
  },
})

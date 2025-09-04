import { Kind } from '@/constants/kinds'
import { createListModule } from '@/hooks/modules/createListModule'
import { useFeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { Feed } from '../../Feed/Feed'
import { RelaySetItem } from './RelaySetItem'

type Props = {
  column?: boolean
  dense?: boolean
}

export const RelaySetList = memo(function RelaySetList(props: Props) {
  const { column, dense } = props
  const pubkey = useCurrentPubkey()
  const feed = useFeedState(createListModule(Kind.RelaySets, pubkey))
  return (
    <Feed
      column={column}
      wrapper={(children) => <html.div style={[styles.root, dense && styles.root$dense]}>{children}</html.div>}
      feed={feed}
      render={(event) => <RelaySetItem event={event} sx={dense && styles.item$dense} />}
    />
  )
})

const styles = css.create({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 3fr))',
  },
  root$dense: {
    gridTemplateColumns: 'repeat(1, minmax(0, 3fr))',
  },
  item$dense: {
    borderLeft: 0,
  },
})

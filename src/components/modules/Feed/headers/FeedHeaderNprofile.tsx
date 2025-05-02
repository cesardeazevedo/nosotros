import { UserHeader } from '@/components/elements/User/UserHeader'
import type { NProfileModule } from '@/stores/modules/nprofile.module'
import { observer } from 'mobx-react-lite'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  module: NProfileModule
}

export const FeedHeaderNprofile = observer(function FeedHeaderNprofile(props: Props) {
  const { module } = props
  return <FeedHeaderBase leading={<UserHeader pubkey={module.pubkey} />} />
})

import { UserHeader } from '@/components/elements/User/UserHeader'
import { memo } from 'react'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  pubkey: string
}

export const FeedHeaderNprofile = memo(function FeedHeaderNprofile(props: Props) {
  return <FeedHeaderBase leading={<UserHeader pubkey={props.pubkey} />} />
})

import { Text } from '@/components/ui/Text/Text'
import { userStore } from '@/stores/users/users.store'
import { observer } from 'mobx-react-lite'
import type { ContentSchema } from 'nostr-editor'
import React from 'react'
import { TextContent } from '../Content/Text'

type Props = {
  pubkey: string
}

export const UserContentAbout = observer(function UserContentAbout(props: Props) {
  const { pubkey } = props
  const user = userStore.get(pubkey)
  const schema = user?.metadata?.aboutParsed as ContentSchema
  return (
    <>
      {schema?.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'paragraph' && <TextContent node={node} />}
          {node.type === 'nevent' && <Text size='lg'>{node.attrs.bech32}</Text>}
        </React.Fragment>
      ))}
    </>
  )
})

import { Text } from '@/components/ui/Text/Text'
import { useUserState } from '@/hooks/state/useUser'
import type { ContentSchema } from 'nostr-editor'
import React, { memo } from 'react'
import { TextContent } from '../Content/Text'

type Props = {
  pubkey: string
}

export const UserContentAbout = memo(function UserContentAbout(props: Props) {
  const { pubkey } = props
  const user = useUserState(pubkey)
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

import { Text } from '@/components/ui/Text/Text'
import type { ContentSchema } from 'nostr-editor'
import React from 'react'
import type { User } from '@/stores/users/user'
import { TextContent } from '../Content/Text'

type Props = {
  user?: User
}

export const UserContentAbout = (props: Props) => {
  const { user } = props
  const schema = user?.meta?.aboutParsed as ContentSchema
  return (
    <>
      {schema?.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'paragraph' && <TextContent node={node} />}
          {node.type === 'nevent' && <Text size='lg'>{node.attrs.nevent}</Text>}
        </React.Fragment>
      ))}
    </>
  )
}

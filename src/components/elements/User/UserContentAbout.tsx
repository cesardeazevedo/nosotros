import type { ContentSchema } from 'content/types'
import React from 'react'
import type User from 'stores/models/user'
import { TextContent } from '../Content/Text'

type Props = {
  user?: User
}

function UserContentAbout(props: Props) {
  const { user } = props
  const schema = user?.meta?.aboutParsed as ContentSchema
  return (
    <>
      {schema?.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'paragraph' && <TextContent node={node} />}
        </React.Fragment>
      ))}
    </>
  )
}

export default UserContentAbout

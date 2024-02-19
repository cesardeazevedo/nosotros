import React from 'react'
import type { User } from 'stores/modules/user.store'
import { TextContent } from '../Content/Text'

type Props = {
  user?: User
}

function UserContentAbout(props: Props) {
  const { user } = props
  return (
    <>
      {user?.metadata?.aboutParsed?.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'paragraph' && <TextContent node={node} />}
        </React.Fragment>
      ))}
    </>
  )
}

export default UserContentAbout

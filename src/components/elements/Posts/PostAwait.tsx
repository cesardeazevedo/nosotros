import { Await } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { PostLoading } from './PostLoading'

type Props = {
  children: ReactNode
  rows?: number
  promise: Promise<0>
}

export const PostAwait = memo(function PostAwait(props: Props) {
  const { rows = 8, children, promise } = props
  return (
    promise && (
      <Await promise={promise} fallback={<PostLoading rows={rows} />}>
        {() => children}
      </Await>
    )
  )
})

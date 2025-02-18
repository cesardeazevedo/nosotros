import { useContentContext } from '@/components/providers/ContentProvider'
import { spacing } from '@/themes/spacing.stylex'
import { lazy, Suspense } from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  src: string
}

const ReactTweet = lazy(() => import('react-tweet').then((x) => ({ default: x.Tweet })))

export const Tweet = (props: Props) => {
  const { src } = props
  const { dense } = useContentContext()
  const id = src.slice(src.lastIndexOf('/') + 1)

  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      <Suspense>
        <ReactTweet id={id} />
      </Suspense>
    </html.div>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
  },
  root$dense: {
    paddingInline: 0,
  },
})

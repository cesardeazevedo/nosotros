import { Editor } from '@/components/elements/Editor/Editor'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import type { FeedModule } from '@/stores/modules/feed.module'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Feed } from './Feed'
import { FeedHeaderBase } from './headers/FeedHeaderBase'

type Props = {
  module: FeedModule
  header?: React.ReactNode
  headline?: React.ReactNode
  renderEditor?: boolean
}

export const FeedRoute = observer(function FeedRoute(props: Props) {
  const { module, headline, header, renderEditor = false } = props
  return (
    <RouteContainer headline={headline} header={header || <FeedHeaderBase feed={module.feed} label={'feed'} />}>
      {renderEditor && (
        <>
          <Editor store={module.feed.editor} />
          <Divider />
        </>
      )}
      <ContentProvider value={{ blured: module.feed.blured }}>
        <Feed feed={module.feed} />
      </ContentProvider>
    </RouteContainer>
  )
})

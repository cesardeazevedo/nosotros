import { EditorMedia } from '@/components/elements/Editor/EditorMedia'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { Divider } from '@/components/ui/Divider/Divider'
import { mediaRoute } from '@/Router'
import { MediaFeed } from './MediaFeed'
import { MediaFeedHeader } from './MediaHeader'

export const MediaRoute = () => {
  const { module } = mediaRoute.useLoaderData()
  return (
    <RouteContainer header={<MediaFeedHeader module={module} />}>
      <EditorMedia initialOpen={false} store={module.feed.editor} />
      <Divider />
      <MediaFeed module={module} />
    </RouteContainer>
  )
}

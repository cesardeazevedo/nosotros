import { EditorMedia } from '@/components/elements/Editor/EditorMedia'
import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { Divider } from '@/components/ui/Divider/Divider'
import { useResetScroll } from '@/hooks/useResetScroll'
import { mediaRoute } from '@/Router'
import { MediaFeed } from './MediaFeed'
import { MediaHeader } from './MediaHeader'

export const MediaRoute = () => {
  const { module } = mediaRoute.useLoaderData()
  useResetScroll()
  return (
    <RouteContainer header={<MediaHeader module={module} />}>
      <EditorMedia initialOpen={false} store={module.feed.editor} />
      <Divider />
      <MediaFeed module={module} />
    </RouteContainer>
  )
}

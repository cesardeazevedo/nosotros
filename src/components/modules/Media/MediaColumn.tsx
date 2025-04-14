import type { MediaModule } from '@/stores/modules/media.module'
import { DeckColumnHeader } from '../Deck/DeckColumnHeader'
import { MediaFeedLayoutButtons } from './MediaFeedLayoutToggles'
import { DeckScroll } from '../Deck/DeckScroll'
import { MediaFeed } from './MediaFeed'

type Props = {
  module: MediaModule
}

export const MediaColumn = (props: Props) => {
  const { module } = props
  return (
    <>
      <DeckColumnHeader
        id={module.id}
        label='Media'
        trailing={() => <MediaFeedLayoutButtons module={module} />}></DeckColumnHeader>
      <DeckScroll>
        <MediaFeed module={module} />
      </DeckScroll>
    </>
  )
}

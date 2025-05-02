import { Editor } from '@/components/elements/Editor/Editor'
import { Divider } from '@/components/ui/Divider/Divider'
import type { HomeModule } from '@/stores/modules/home.module'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { HomeHeader } from './HomeHeader'

type Props = {
  module: HomeModule
}

export const HomeColumn = (props: Props) => {
  const { module } = props
  return (
    <>
      <DeckColumnFeed
        wrapper={(children) => (
          <>
            <Editor initialOpen={false} store={module.feed.editor} />
            <Divider />
            {children}
          </>
        )}
        header={<HomeHeader renderEditor={false} module={module} />}
        feed={module.feed}
      />
    </>
  )
}

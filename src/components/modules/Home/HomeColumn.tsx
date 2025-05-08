import { Editor } from '@/components/elements/Editor/Editor'
import { Divider } from '@/components/ui/Divider/Divider'
import type { HomeModule } from '@/stores/modules/home.module'
import { observer } from 'mobx-react-lite'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { HomeHeader } from './HomeHeader'

type Props = {
  module: HomeModule
}

export const HomeColumn = observer(function HomeColumn(props: Props) {
  const { module } = props
  return (
    <>
      <DeckColumnFeed
        renderDivider={false}
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
})

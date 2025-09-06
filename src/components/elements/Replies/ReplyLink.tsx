import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { createEventModule } from '@/hooks/modules/createEventModule'
import { Link } from '@tanstack/react-router'
import type { NEvent } from 'nostr-tools/nip19'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: ReactNode
  nevent: NEvent | string | undefined
}

export const ReplyLink = memo(function ReplyLink(props: Props) {
  const { nevent } = props
  const deck = useDeckAddNextColumn(() => createEventModule(nevent))
  const content = <ContentProvider value={{ disableLink: true }}>{props.children}</ContentProvider>
  if (deck.isDeck) {
    return (
      <html.a onClick={deck.add} style={styles.cursor}>
        {content}
      </html.a>
    )
  }

  return (
    <Link to='/$nostr' params={{ nostr: nevent as string }}>
      {content}
    </Link>
  )
})

const styles = css.create({
  cursor: {
    cursor: 'pointer',
  },
})

import { LinkNAddress } from '@/components/elements/Links/LinkNAddress'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { ReactNode } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  children: ReactNode
}

export const ListQuote = (props: Props) => {
  return (
    <ContentProvider value={{ disableLink: false }}>
      <LinkNAddress event={props.event}>
        <Paper outlined sx={styles.root}>
          <html.div style={styles.highlight}>{props.children}</html.div>
        </Paper>
      </LinkNAddress>
    </ContentProvider>
  )
}

const styles = css.create({
  root: {
    overflow: 'hidden',
  },
  highlight: {
    backgroundColor: {
      default: 'transparent',
      ':hover:not(:has(button:hover))': 'rgba(125, 125, 125, 0.04)',
    },
  },
})

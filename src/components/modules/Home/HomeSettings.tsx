import { Divider } from '@/components/ui/Divider/Divider'
import { SettingsFilters } from '@/components/elements/DeckSettings/SettingsFilters'
import { SettingsRelays } from '@/components/elements/DeckSettings/SettingsRelays'
import { html, css } from 'react-strict-dom'

export const HomeSettings = () => {
  return (
    <html.div style={styles.root}>
      <Divider />
      <SettingsRelays />
      <SettingsFilters />
    </html.div>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
  },
})

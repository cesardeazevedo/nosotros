import { observer } from 'mobx-react-lite'
import { SettingsNIP05 } from './SettingsNIP05'
import { SettingsOutbox } from './SettingsOutbox'
// import { SettingsRelayHints } from './SettingsRelayHints'

export const SettingsNetwork = observer(function SettingsNetwork() {
  return (
    <>
      <SettingsOutbox />
      {/* <SettingsRelayHints /> */}
      <SettingsNIP05 />
    </>
  )
})

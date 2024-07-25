import { Divider, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Switch, Typography } from '@mui/material'
import { IconBolt, IconHeart } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { settingsStore } from 'stores/ui/settings.store'

const SettingsNostr = observer(function SettingsNostr() {
  return (
    <List sx={{}}>
      <ListSubheader sx={{ lineHeight: 2 }}>Config</ListSubheader>
      <ListItem dense>
        <ListItemText
          primary={<Typography variant='subtitle1'>Outbox</Typography>}
          secondary='The outbox model helps you find notes from others people relays'
        />
        <Switch
          edge='end'
          checked={settingsStore.nostrSettings.outboxEnabled}
          onClick={() => settingsStore.toggleSettings('outboxEnabled')}
        />
      </ListItem>
      <ListItem dense sx={{ mb: 1 }}>
        <ListItemText primary={<Typography variant='subtitle1'>Relay Hints</Typography>} />
        <Switch
          edge='end'
          checked={settingsStore.nostrSettings.hintsEnabled}
          onChange={() => settingsStore.toggleSettings('hintsEnabled')}
        />
      </ListItem>
      <ListItem dense sx={{ mb: 1 }}>
        <ListItemText primary={<Typography variant='subtitle1'>NIP05</Typography>} />
        <Switch
          edge='end'
          checked={settingsStore.nostrSettings.nip05enabled}
          onChange={() => settingsStore.toggleSettings('nip05enabled')}
        />
      </ListItem>
      <Divider />
      <ListSubheader sx={{ mt: 2, lineHeight: 2 }}>UI</ListSubheader>
      <ListItem dense>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <IconHeart strokeWidth='1.4' />
        </ListItemIcon>
        <ListItemText primary={<Typography variant='subtitle1'>Reactions</Typography>} />
        <Switch
          edge='end'
          checked={settingsStore.nostrSettings.nip25enabled}
          onChange={() => settingsStore.toggleSettings('nip25enabled')}
        />
      </ListItem>
      <ListItem dense>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <IconBolt strokeWidth='1.4' />
        </ListItemIcon>
        <ListItemText primary={<Typography variant='subtitle1'>Zaps</Typography>} />
        <Switch
          edge='end'
          checked={settingsStore.nostrSettings.nip57enabled}
          onChange={() => settingsStore.toggleSettings('nip57enabled')}
        />
      </ListItem>
    </List>
  )
})

export default SettingsNostr

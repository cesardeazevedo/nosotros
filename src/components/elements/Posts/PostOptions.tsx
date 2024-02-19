import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  MenuList,
  Popover,
} from '@mui/material'
import {
  IconBookmark,
  IconDots,
  IconEyeOff,
  IconInfoSquareRounded,
  IconUserMinus,
  IconVolumeOff,
} from '@tabler/icons-react'
import Dialog from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import type { Note } from 'stores/modules/note.store'
import type { User } from 'stores/modules/user.store'
import PostStats from './PostDialogs/PostStats'

type Props = {
  note: Note
}

function isMobileDevice() {
  return 'ontouchstart' in window
}

function Options(props: { user: User | undefined; debugDialog: boolean; setDebugDialog: (value: boolean) => void }) {
  const { user, debugDialog, setDebugDialog } = props
  const name = user?.displayName
  return (
    <>
      <MenuList>
        <MenuItem onClick={() => setDebugDialog(!debugDialog)}>
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            <IconInfoSquareRounded size={22} />
          </ListItemIcon>
          <ListItemText primary={'See post details'} />
        </MenuItem>
        <Divider />
        <ListSubheader sx={{ backgroundColor: 'transparent', mt: 2, lineHeight: '12px' }}>Coming Soon</ListSubheader>
        <MenuItem disabled>
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            <IconBookmark size={22} />
          </ListItemIcon>
          <ListItemText primary={'Save Post'} secondary={'See the post in your bookmark list'} />
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            <IconEyeOff size={22} />
          </ListItemIcon>
          <ListItemText primary={'Hide Post'} />
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            <IconVolumeOff size={22} />
          </ListItemIcon>
          <ListItemText primary={`Mute ${name}`} secondary={`Mute all ${name} posts`} />
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            <IconUserMinus size={22} />
          </ListItemIcon>
          <ListItemText primary={`Unfollow ${name}`} secondary={`Stop seeing ${name} in your timeline`} />
        </MenuItem>
      </MenuList>
    </>
  )
}

const PostOptions = observer(function PostOptions(props: Props) {
  const { note } = props
  const [debugDialog, setDebugDialog] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>()
  const isMobile = isMobileDevice()
  const user = note.user
  return (
    <>
      <Dialog
        title='Stats'
        open={debugDialog}
        onClose={() => {
          setDebugDialog(false)
          setAnchorEl(null)
        }}>
        <PostStats data={note.event} />
      </Dialog>
      <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
        <IconDots stroke='currentColor' strokeWidth='2.0' size={20} />
      </IconButton>
      {!isMobile && (
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          transitionDuration={50}
          sx={{ zIndex: 1000 }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Options user={user} debugDialog={debugDialog} setDebugDialog={setDebugDialog} />
        </Popover>
      )}
      {isMobile && (
        <Dialog open={!!anchorEl} onClose={() => setAnchorEl(null)} mobileHeight={390}>
          <Options
            user={user}
            debugDialog={debugDialog}
            setDebugDialog={(value) => {
              setAnchorEl(null)
              setDebugDialog(value)
            }}
          />
        </Dialog>
      )}
    </>
  )
})

export default PostOptions

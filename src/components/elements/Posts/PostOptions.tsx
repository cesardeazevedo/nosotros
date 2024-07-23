import {
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Popover,
} from '@mui/material'

import {
  IconBookmark,
  IconColumnInsertRight,
  IconCopy,
  IconDots,
  IconEyeOff,
  IconInfoSquareRounded,
  IconLink,
  IconUserMinus,
  IconVolumeOff,
} from '@tabler/icons-react'

import { useMatch } from '@tanstack/react-router'
import Dialog from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type Note from 'stores/models/note'
import { deckStore } from 'stores/ui/deck.store'
import { Row } from '../Layouts/Flex'
import Tooltip from '../Layouts/Tooltip'
import PostStats from './PostDialogs/PostStats'

type Props = {
  note: Note
}

type PropsOptions = {
  onCopyIdClick: () => void
  onCopyLinkClick: () => void
  onDetailsClick: () => void
}

function isMobileDevice() {
  return 'ontouchstart' in window
}

function Options(props: PropsOptions) {
  return (
    <List>
      <ListItemButton onClick={props.onDetailsClick}>
        <ListItemIcon sx={{ color: 'text.secondary' }}>
          <IconInfoSquareRounded size={22} />
        </ListItemIcon>
        <ListItemText primary={'Details'} />
      </ListItemButton>
      <Divider />
      <ListItemButton onClick={props.onCopyIdClick}>
        <ListItemIcon sx={{ color: 'text.secondary' }}>
          <IconCopy size={22} />
        </ListItemIcon>
        <ListItemText primary='Copy id' />
      </ListItemButton>
      <ListItemButton onClick={props.onCopyLinkClick}>
        <ListItemIcon sx={{ color: 'text.secondary' }}>
          <IconLink size={22} />
        </ListItemIcon>
        <ListItemText primary='Copy link' />
      </ListItemButton>
      <Divider />
      <ListSubheader sx={{ backgroundColor: 'transparent', my: 2, lineHeight: '10px' }}>Coming Soon</ListSubheader>
      <ListItemButton disabled>
        <ListItemIcon sx={{ color: 'text.secondary' }}>
          <IconBookmark size={22} />
        </ListItemIcon>
        <ListItemText primary='Bookmark' />
      </ListItemButton>
      <ListItemButton disabled>
        <ListItemIcon sx={{ color: 'text.secondary' }}>
          <IconEyeOff size={22} />
        </ListItemIcon>
        <ListItemText primary='Hide' />
      </ListItemButton>
      <ListItemButton disabled sx={{ color: 'error.main' }}>
        <ListItemIcon sx={{ color: 'inherit' }}>
          <IconVolumeOff size={22} strokeWidth='1.5' />
        </ListItemIcon>
        <ListItemText primary='Mute' />
      </ListItemButton>
      <ListItemButton disabled sx={{ color: 'error.main' }}>
        <ListItemIcon sx={{ color: 'inherit' }}>
          <IconUserMinus size={22} />
        </ListItemIcon>
        <ListItemText primary='Unfollow' />
      </ListItemButton>
    </List>
  )
}

const PostOptions = observer(function PostOptions(props: Props) {
  const { note } = props
  const [debugDialog, setDebugDialog] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>()
  const isMobile = isMobileDevice()
  const isDeck = useMatch({ strict: false }).routeId === '/deck'

  const handleClose = useCallback(() => {
    setDebugDialog(false)
    setAnchorEl(null)
  }, [])

  const handleCopy = useCallback((value: string) => {
    return () => {
      const type = 'text/plain'
      const blob = new Blob([value], { type })
      window.navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).then(() => {
        toast('Copied', { closeButton: false, position: 'bottom-right', style: { right: 0, width: 'fit-content' } })
        handleClose()
      })
    }
  }, [handleClose])

  const handleDetailsDialog = useCallback(() => {
    setDebugDialog(!debugDialog)
  }, [debugDialog])

  const handleNoteDeck = useCallback(() => {
    deckStore.addNoteColumn({ id: note.id })
  }, [note])


  const nevent = note.nevent
  const link = window.location.origin + '/' + nevent

  return (
    <>
      <Dialog title='Stats' open={debugDialog} onClose={handleClose}>
        <PostStats note={note} />
      </Dialog>
      <Row>
        {isDeck && note.meta.isRoot && (
          <Tooltip arrow title='Add post on deck'>
            <IconButton size='small' sx={{ color: 'text.secondary', mr: 1 }} onClick={handleNoteDeck}>
              <IconColumnInsertRight stroke='currentColor' strokeWidth='1.4' />
            </IconButton>
          </Tooltip>
        )}
        <IconButton size='small' sx={{ color: 'text.secondary' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <IconDots stroke='currentColor' strokeWidth='2.0' size={20} />
        </IconButton>
      </Row>
      {!isMobile && (
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          transitionDuration={50}
          sx={{ zIndex: 1000 }}
          slotProps={{ paper: { sx: { width: 240 } } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Options
            onCopyIdClick={handleCopy(nevent)}
            onCopyLinkClick={handleCopy(link)}
            onDetailsClick={handleDetailsDialog}
          />
        </Popover>
      )}
      {isMobile && (
        <Dialog open={!!anchorEl} onClose={() => setAnchorEl(null)} mobileHeight={420}>
          <Options
            onCopyIdClick={handleCopy(nevent)}
            onCopyLinkClick={handleCopy(link)}
            onDetailsClick={handleDetailsDialog}
          />
        </Dialog>
      )}
    </>
  )
})

export default PostOptions

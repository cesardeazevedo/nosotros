import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { useDialogControl } from '@/hooks/useDialogs'
import { useImetaList } from '@/hooks/useEventUtils'
import { useLG } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react'
import { useMatch, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { memo, useLayoutEffect, useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { SlideImage, SlideVideo } from 'yet-another-react-lightbox'
import Lightbox from 'yet-another-react-lightbox'
import VideoPlugin from 'yet-another-react-lightbox/plugins/video'
import 'yet-another-react-lightbox/styles.css'
import { Threads } from '../elements/Threads/Threads'
import { ContentProvider } from '../providers/ContentProvider'
import { CircularProgress } from '../ui/Progress/CircularProgress'
import { circularProgressTokens } from '../ui/Progress/CircularProgress.stylex'

const LightboxPortal = function LightboxPortal(props: { open?: boolean; children: ReactNode }) {
  const isLG = useLG()
  return (
    <html.div style={props.open && portalStyles.wrapper}>
      <html.div id='lightbox' style={portalStyles.lightboxContainer} />
      {props.open && !isLG && <html.div style={portalStyles.repliesPane}>{props.children}</html.div>}
    </html.div>
  )
}

export const ImagesDialog = memo(function ImagesDialog() {
  const isLG = useLG()
  const navigate = useNavigate()
  const [dialog, closeDialog] = useDialogControl('image')
  const [portal, setPortal] = useState(() => document.querySelector('#lightbox'))
  const mediaIndex = useMatch({
    from: '__root__',
    select: (x) => x.search?.media,
  })
  const nevent = useMatch({
    from: '__root__',
    select: (x) => x.search?.n,
  })
  const event = useEventFromNIP19(nevent || '', undefined, false)
  const list = useImetaList(event.data)

  const open = !!dialog || (!!nevent && mediaIndex !== undefined)
  const src = dialog ? dialog.src : list[mediaIndex || 0]?.[1]

  useLayoutEffect(() => {
    if (!portal) {
      setPortal(document.querySelector('#lightbox'))
    }
  }, [open, portal])

  const handleClose = () => {
    closeDialog()
    navigate({ to: '.', search: ({ media, n, ...rest } = {}) => rest, replace: true })
  }

  const slides = useMemo(() => {
    if (!open) return []
    if (list.length > 0) {
      return list.map(([type, src, metadata]) => {
        if (type === 'image') {
          return {
            type: 'image',
            src,
            width: metadata?.dim?.width,
            height: metadata?.dim?.height,
          } as SlideImage
        }
        return {
          type: 'video',
          sources: [
            {
              src,
              type: metadata?.m || 'video/mp4',
            },
          ],
          loop: true,
          muted: true,
          autoPlay: true,
          width: metadata?.dim?.width,
          height: metadata?.dim?.height,
        } as SlideVideo
      })
    }
    return [
      {
        src: getImgProxyUrl('high_res', src),
      },
    ]
  }, [open, list])

  const currentIndex = mediaIndex

  return (
    <html.div
      {...css.props(styles.container)}
      onClick={(e) => {
        const target = ('target' in e ? e.target : null) as HTMLElement | null
        if (target?.classList?.contains('yarl__slide_current')) {
          handleClose()
        }
      }}>
      <LightboxPortal open={open}>
        <ContentProvider value={{ autoPlay: false }}>
          {event.data && !!nevent && (
            <Threads event={event.data} maxLevel={Infinity} renderEditor renderReplies renderRepliesSummary={false} />
          )}
        </ContentProvider>
      </LightboxPortal>
      <style>
        {`
        .yarl__button:hover {
          transform: scale(1.1) !important;
        }
        .yarl__button:active {
          transform: scale(1.0) !important;
        }
        .yarl__button:disabled {
          display: none;
        }
       `}
      </style>
      <Lightbox
        open={open}
        close={handleClose}
        slides={slides}
        index={currentIndex}
        portal={{
          root: event.data && !!nevent ? portal : undefined,
        }}
        plugins={[VideoPlugin]}
        carousel={{ preload: 10, finite: true }}
        controller={{
          touchAction: 'none',
          closeOnPullUp: true,
          closeOnBackdropClick: true,
          closeOnPullDown: true,
        }}
        styles={{
          container: {
            width: '100%',
          },
          root: {
            width: !isLG && nevent ? 'calc(100% - 600px)' : '100%',
          },
          button: {
            margin: 12,
            position: 'absolute',
            transition: 'transform 0.2s ease',
            transform: 'scale(1)',
            backgroundColor: colors.gray9,
            borderRadius: '100%',
            padding: 10,
          },
        }}
        render={{
          iconLoading: () => <CircularProgress size='md' />,
          iconPrev: () => <IconArrowLeft strokeWidth='1.5' />,
          iconNext: () => <IconArrowRight strokeWidth='1.5' />,
          iconClose: () => <IconX strokeWidth='1.5' />,
        }}
      />
    </html.div>
  )
})

const portalStyles = css.create({
  wrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    zIndex: 1000,
    [circularProgressTokens.color]: 'white',
  },
  lightboxContainer: {
    flex: 1,
    position: 'relative',
  },
  repliesPane: {
    width: 600,
    backgroundColor: palette.surfaceContainerLowest,
    padding: spacing.padding1,
    borderLeft: '1px solid',
    borderLeftColor: palette.outline,
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 10000,
  },
})

const styles = css.create({
  container: {
    position: 'relative',
  },
})

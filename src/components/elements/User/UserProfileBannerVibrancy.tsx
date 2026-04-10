import { mediaErrorsAtom } from '@/atoms/media.atoms'
import { useUserState } from '@/hooks/state/useUser'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { useAtomValue } from 'jotai'
// @ts-ignore
import { Vibrant } from 'node-vibrant/browser'
import { useObservable, useObservableState } from 'observable-hooks'
import { memo } from 'react'
import { catchError, from, of, switchMap } from 'rxjs'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey: string
}

const FALLBACK_COLORS = ['rgba(110, 160, 210, 0.18)', 'rgba(230, 140, 120, 0.14)', 'rgba(255, 210, 120, 0.1)']

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const normalized =
    value.length === 3
      ? value
        .split('')
        .map((x) => x + x)
        .join('')
      : value
  const int = Number.parseInt(normalized, 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

function chroma(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return Math.max(r, g, b) - Math.min(r, g, b)
}

function alpha(hex: string, value: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${value})`
}

async function getBannerPaletteFromImage(image: HTMLImageElement) {
  const palette = await Vibrant.from(image).maxDimension(320).quality(2).getPalette()
  const colors = [
    palette.Vibrant?.hex,
    palette.LightVibrant?.hex,
    palette.DarkVibrant?.hex,
    palette.Muted?.hex,
    palette.LightMuted?.hex,
    palette.DarkMuted?.hex,
  ].filter((color): color is string => !!color)

  const vivid = colors.filter((color) => chroma(color) > 28)
  return (vivid.length >= 2 ? vivid : colors).slice(0, 4)
}

async function getBannerPalette(src: string) {
  const image = new window.Image()
  image.crossOrigin = 'anonymous'

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error(`Fail to load image: ${src}`))
    image.src = src
  })

  return getBannerPaletteFromImage(image)
}

function createBackground(colors: string[]) {
  const [a, b, c, d] =
    colors.length >= 4 ? colors : colors.length === 3 ? [colors[0], colors[1], colors[2], colors[1]] : FALLBACK_COLORS

  return {
    background: `
      radial-gradient(42rem 20rem at 8% 8%, ${alpha(a, 0.34)} 0%, transparent 68%),
      radial-gradient(38rem 18rem at 92% 12%, ${alpha(b, 0.28)} 0%, transparent 64%),
      radial-gradient(34rem 16rem at 50% 0%, ${alpha(c, 0.18)} 0%, transparent 70%),
      radial-gradient(44rem 22rem at 50% 46%, ${alpha(d, 0.12)} 0%, transparent 72%)
    `,
  } as const
}

export const UserProfileBannerVibrancy = memo(function UserProfileBannerVibrancy(props: Props) {
  const { pubkey } = props
  const user = useUserState(pubkey)
  const { banner } = user?.metadata || {}
  const hasError = useAtomValue(mediaErrorsAtom).has(banner || '')
  const proxiedBanner = banner
  const colors$ = useObservable<string[], [string | undefined, boolean]>(
    (input$) =>
      input$.pipe(
        switchMap(([src, hasMediaError]) => {
          if (!src || !src.startsWith('http') || hasMediaError) {
            return of([])
          }
          return from(getBannerPalette(src)).pipe(
            switchMap((colors) => {
              console.log('UserProfileBannerVibrancy', {
                banner: src,
                extractedColors: colors,
              })
              return of(colors)
            }),
            catchError((error) => {
              console.log('UserProfileBannerVibrancy error', {
                banner: src,
                error,
              })
              return of([])
            }),
          )
        }),
      ),
    [proxiedBanner, hasError],
  )
  const colors = useObservableState<string[]>(colors$, [])

  const background = createBackground(colors.length > 0 ? colors : FALLBACK_COLORS)

  return (
    <html.div style={styles.root}>
      <html.div style={[styles.layer, styles.layer$background(background.background)]} />
      <html.div style={styles.fade} />
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    height: 0,
    pointerEvents: 'none',
    overflow: 'visible',
    zIndex: 0,
  },
  layer: {
    position: 'absolute',
    top: -68,
    left: '50%',
    width: '100vw',
    height: 520,
    transform: 'translateX(-50%)',
    filter: 'blur(44px)',
    opacity: 0.95,
  },
  layer$background: (background: string) => ({
    background,
  }),
  fade: {
    position: 'absolute',
    top: -68,
    left: '50%',
    width: '100vw',
    height: 360,
    transform: 'translateX(-50%)',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 44%, rgba(255,255,255,0) 100%)',
  },
})

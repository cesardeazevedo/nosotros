import type { ColorKey, ColorPalette } from '@/themes/palette.stylex'

export type ContainerTextColors = keyof Pick<
  ColorPalette,
  | 'onSurface'
  | 'onPrimary'
  | 'onPrimaryContainer'
  | 'onSecondary'
  | 'onSecondaryContainer'
  | 'onTertiary'
  | 'onTertiaryContainer'
  | 'inverseOnSurface'
  | 'onError'
  | 'onErrorContainer'
>

export function getContainerTextColor(surface?: ColorKey): ContainerTextColors {
  switch (surface) {
    case 'primary':
      return 'onPrimary'
    case 'primaryContainer':
      return 'onPrimaryContainer'
    case 'secondary':
      return 'onSecondary'
    case 'secondaryContainer':
      return 'onSecondaryContainer'
    case 'tertiary':
      return 'onTertiary'
    case 'tertiaryContainer':
      return 'onTertiaryContainer'
    case 'inverseSurface':
      return 'inverseOnSurface'
    case 'error':
      return 'onError'
    case 'errorContainer':
      return 'onErrorContainer'
    default:
      return 'onSurface'
  }
}

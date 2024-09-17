import type { Placement } from '@floating-ui/react'

export const getPlacementSideTransformOrigin = (placement: Placement): string => {
  switch (placement) {
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      return '50% 0'

    case 'left':
    case 'left-start':
    case 'left-end':
      return '100% 50%'

    case 'right':
    case 'right-start':
    case 'right-end':
      return '0 50%'

    case 'top':
    case 'top-start':
    case 'top-end':
    default:
      return '50% 100%'
  }
}

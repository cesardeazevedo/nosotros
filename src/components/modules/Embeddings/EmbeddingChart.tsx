import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { css, html } from 'react-strict-dom'
import { UMAP } from 'umap-js'

type Entry = {
  pubkey: string
  created_at: number
  distance: number
  similarity: number
  vector: number[]
  is_anchor?: boolean
}

type Props = {
  entries: Entry[]
}

export const EmbeddingChart = (props: Props) => {
  const { entries } = props
  const queryVectors = entries.map((entry) => entry.vector)
  const points = queryVectors.length > 1 ? buildUmapPoints(entries) : []

  if (!points.length) {
    return null
  }

  return (
    <Stack justify='flex-end' sx={styles.chartRow}>
      <html.div style={styles.chartCard}>
        <Stack horizontal={false} gap={0.5} sx={styles.chartLayout}>
          <html.div style={styles.chartCanvas} aria-label='Closest users map' data-explore-chart-root>
            <html.div style={styles.chartPattern} />
            <html.div style={styles.chartFade} />
            <html.div style={styles.chartLabel}>
              <Text variant='label' size='sm'>
                {points.length} nodes
              </Text>
            </html.div>
            <ContentProvider value={{ disableLink: true, disablePopover: true }}>
              {points.map((point) => (
                <div
                  key={point.pubkey}
                  className={css.props(styles.chartMarker, point.isAnchor && styles.chartMarker$anchor).className}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                  }}>
                  <div
                    data-explore-marker={point.isAnchor ? 'anchor' : 'point'}
                    data-distance-ratio={point.distanceRatio}
                    className={css.props(
                      styles.chartAvatarFrame,
                      point.isAnchor ? styles.chartAvatarFrame$anchor : styles.chartAvatarFrame$point,
                    ).className}
                    style={{
                      borderColor: point.fill,
                    }}>
                    <UserAvatar
                      pubkey={point.pubkey}
                      size={point.isAnchor ? 'xs' : 'xxs'}
                      sx={styles.chartAvatar}
                    />
                  </div>
                </div>
              ))}
            </ContentProvider>
          </html.div>
        </Stack>
      </html.div>
    </Stack>
  )
}

const styles = css.create({
  chartRow: {
    width: '100%',
    // backgroundColor: palette.surface,
  },
  chartCard: {
    width: '100%',
    height: 260,
    overflow: 'hidden',
  },
  chartLayout: {
    width: '100%',
    height: '100%',
  },
  chartCanvas: {
    position: 'relative',
    width: '100%',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    // backgroundColor: palette.surfaceContainerLow,
  },
  chartPattern: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    backgroundImage: {
      default: 'url(/pattern.png)',
      '@media (prefers-color-scheme: dark)': 'url(/pattern-dark.png)',
    },
    backgroundRepeat: 'repeat',
    backgroundSize: '256px 256px',
    opacity: 0.72,
    pointerEvents: 'none',
  },
  chartFade: {
    // position: 'absolute',
    // inset: 0,
    // zIndex: 1,
    // backgroundColor: palette.surfaceContainerLow,
    // maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.28) 28%, rgba(0, 0, 0, 0.68) 52%, rgba(0, 0, 0, 0.94) 78%, black 100%)',
    // WebkitMaskImage:
    //   'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.28) 28%, rgba(0, 0, 0, 0.68) 52%, rgba(0, 0, 0, 0.94) 78%, black 100%)',
    // pointerEvents: 'none',
  },
  chartLabel: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 3,
    paddingBlock: 4,
    paddingInline: 8,
    borderRadius: 999,
    backgroundColor: palette.surfaceContainerHigh,
    color: palette.onSurface,
    pointerEvents: 'none',
  },
  chartMarker: {
    position: 'absolute',
    zIndex: 2,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartMarker$anchor: {
    zIndex: 10,
  },
  chartAvatarFrame: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    borderStyle: 'solid',
    backgroundColor: 'rgba(10,10,10,0.18)',
    overflow: 'hidden',
  },
  chartAvatarFrame$point: {
    borderWidth: 1,
    padding: 0,
  },
  chartAvatarFrame$anchor: {
    borderWidth: 2,
    padding: 0,
  },
  chartAvatar: {
    boxShadow: 'none',
  },
})

const DEFAULT_PROXIMITY_EMPHASIS = 1

type UmapPoint = {
  pubkey: string
  x: number
  y: number
  fill: string
  isAnchor: boolean
  distanceRatio: number
}

function buildUmapPoints(entries: Entry[]) {
  if (entries.length < 2) {
    return []
  }

  const orderedEntries = [...entries].sort((a, b) => {
    if (!!a.is_anchor !== !!b.is_anchor) {
      return a.is_anchor ? -1 : 1
    }
    if (a.distance !== b.distance) {
      return a.distance - b.distance
    }
    if (a.created_at !== b.created_at) {
      return b.created_at - a.created_at
    }
    return a.pubkey.localeCompare(b.pubkey)
  })

  const umap = new UMAP({
    nComponents: 2,
    nNeighbors: Math.max(2, Math.min(12, orderedEntries.length - 1)),
    minDist: 0.18,
    spread: 1.1,
    random: createSeededRandom(42),
  })

  const embedding = umap.fit(orderedEntries.map((entry) => entry.vector))
  const xs = embedding.map((point) => point[0])
  const ys = embedding.map((point) => point[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const nonAnchorDistances = orderedEntries.filter((entry) => !entry.is_anchor).map((entry) => entry.distance)
  const minDistance = nonAnchorDistances.length ? Math.min(...nonAnchorDistances) : 0
  const maxDistance = nonAnchorDistances.length ? Math.max(...nonAnchorDistances) : 1

  return orderedEntries.map((entry, index) => {
    const distanceRatio = entry.is_anchor ? 0 : normalizeRatio(entry.distance, minDistance, maxDistance)
    return {
      pubkey: entry.pubkey,
      x: normalizeCoordinate(embedding[index][0], minX, maxX, 6, 94),
      y: normalizeCoordinate(embedding[index][1], minY, maxY, 8, 92),
      fill: entry.is_anchor ? '#ffffff' : getBorderColor(distanceRatio, DEFAULT_PROXIMITY_EMPHASIS),
      isAnchor: !!entry.is_anchor,
      distanceRatio,
    }
  }) satisfies UmapPoint[]
}

function normalizeCoordinate(value: number, min: number, max: number, outMin: number, outMax: number) {
  if (min === max) {
    return (outMin + outMax) / 2
  }

  const ratio = (value - min) / (max - min)
  return outMin + ratio * (outMax - outMin)
}

function normalizeRatio(distance: number, minDistance: number, maxDistance: number) {
  if (minDistance === maxDistance) {
    return 0
  }

  return Math.max(0, Math.min((distance - minDistance) / (maxDistance - minDistance), 1))
}

function getBorderColor(ratio: number, emphasis: number) {
  const curved = Math.pow(Math.max(0, Math.min(ratio, 1)), emphasis)
  const hue = 8 + curved * 126
  return `hsl(${hue}deg 78% 50%)`
}

function createSeededRandom(seed: number) {
  let current = seed
  return () => {
    const value = Math.sin(current++) * 10000
    return value - Math.floor(value)
  }
}

import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useUserSimilarity } from '@/hooks/state/useUserSimilarity'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey: string
  event?: NostrEventDB
}

export const UserRank = memo(function UserRank(props: Props) {
  const rank = props.event?.tags.find((tag) => tag[0] === 'rank')?.[1]
  const rankValue = Number.isFinite(Number(rank)) ? Math.min(100, Math.max(0, Number(rank))) : undefined
  const progress = rankValue === undefined ? undefined : Math.round(rankValue)
  const similarity = useUserSimilarity(props.pubkey)
  const similarityValue = similarity.score === undefined ? undefined : Math.round(similarity.score * 100)
  return (
    <Stack gap={0.5} sx={styles.root}>
      {/* {progress !== undefined && ( */}
      {/*   <Stack sx={styles.rank}> */}
      {/*     <html.div style={[styles.rankRing, styles.rankProgress(progress)]} /> */}
      {/*     <html.span style={styles.rankValue}>{progress}</html.span> */}
      {/*   </Stack> */}
      {/* )} */}
      {similarityValue !== undefined && (
        <Stack sx={styles.rank}>
          <html.div style={[styles.rankRing, styles.similarityProgress(similarityValue)]} />
          <html.span style={styles.rankValue}>{similarityValue}</html.span>
        </Stack>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    alignItems: 'center',
  },
  rank: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: shape.full,
    fontSize: 10,
    fontWeight: 800,
    position: 'relative',
    color: palette.onSurface,
  },
  rankRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: shape.full,
    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
    mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
  },
  rankProgress: (progress: number) => ({
    backgroundImage: `conic-gradient(${palette.tertiary} 0% ${progress}%, ${palette.outlineVariant} ${progress}% 100%)`,
  }),
  rankValue: {
    position: 'relative',
    zIndex: 1,
    fontWeight: 600,
    lineHeight: 1,
  },
  similarityProgress: (progress: number) => ({
    backgroundImage: `conic-gradient(${palette.primary} 0% ${progress}%, ${palette.outlineVariant} ${progress}% 100%)`,
  }),
})

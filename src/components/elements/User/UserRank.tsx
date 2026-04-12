import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useUserState } from '@/hooks/state/useUser'
import { useUserSimilarity } from '@/hooks/state/useUserSimilarity'
import { useSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey: string
  renderTaRank?: boolean
  renderEmbeddingSimilarity?: boolean
}

type ChildProps = {
  pubkey: string
}

export const UserTARank = memo(function UserTARank(props: ChildProps) {
  const { pubkey } = props
  const user = useUserState(pubkey)
  const rank = user.trustedAssertionEvent?.tags.find((tag) => tag[0] === 'rank')?.[1]
  const rankValue = Number.isFinite(Number(rank)) ? Math.min(100, Math.max(0, Number(rank))) : undefined
  const progress = rankValue === undefined ? undefined : Math.round(rankValue)

  if (progress === undefined) {
    return null
  }

  return (
    <Stack sx={styles.rank}>
      <html.div style={[styles.rankRing, styles.rankProgress(progress)]} />
      <html.span style={styles.rankValue}>{progress}</html.span>
    </Stack>
  )
})

export const UserEmbeddingSimilarity = memo(function UserEmbeddingSimilarity(props: ChildProps) {
  const { pubkey } = props
  const similarity = useUserSimilarity(pubkey)
  const similarityValue = similarity.score === undefined ? undefined : Math.round(similarity.score * 100)

  if (similarityValue === undefined) {
    return null
  }

  return (
    <Tooltip
      enterDelay={0}
      text='This score shows how similar this profile is to you. Higher scores mean a closer match based on the app’s embedding model.'>
      <Stack sx={styles.rank}>
        <html.div style={[styles.rankRing, styles.similarityProgress(similarityValue)]} />
        <html.span style={styles.rankValue}>{similarityValue}</html.span>
      </Stack>
    </Tooltip>
  )
})

export const UserRank = memo(function UserRank(props: Props) {
  const { pubkey, renderTaRank = false, renderEmbeddingSimilarity } = props
  const settings = useSettings()
  const showEmbeddingSimilarity = renderEmbeddingSimilarity ?? settings.renderEmbeddingSimilarity

  if (!renderTaRank && !showEmbeddingSimilarity) {
    return null
  }

  return (
    <Stack gap={0.5} sx={styles.root}>
      {renderTaRank ? <UserTARank pubkey={pubkey} /> : null}
      {showEmbeddingSimilarity ? <UserEmbeddingSimilarity pubkey={pubkey} /> : null}
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
    width: 21,
    height: 21,
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
    letterSpacing: -0.8,
  },
  similarityProgress: (progress: number) => ({
    backgroundImage: `conic-gradient(${palette.primary} 0% ${progress}%, ${palette.outlineVariant} ${progress}% 100%)`,
  }),
})

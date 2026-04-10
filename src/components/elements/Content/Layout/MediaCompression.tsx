import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Paper } from '@/components/ui/Paper/Paper'
import { Slider } from '@/components/ui/Slider/Slider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { ImageQuality } from '@/utils/compression'
import { css } from 'react-strict-dom'

type CompressionQuality = ImageQuality

type Props = {
  quality: CompressionQuality
  onQualityChange: (quality: CompressionQuality) => void
  includeAudio?: boolean
  onToggleAudio?: () => void
}

const QUALITY_SLIDER_VALUES: CompressionQuality[] = ['low', 'medium', 'high', 'uncompressed']

const getQualityLabel = (quality: CompressionQuality) => {
  switch (quality) {
    case 'uncompressed':
      return 'Uncompressed'
    case 'low':
      return 'Low'
    case 'medium':
      return 'Medium'
    default:
      return 'High'
  }
}

export const MediaCompression = (props: Props) => {
  const { quality, onQualityChange, includeAudio, onToggleAudio } = props
  return (
    <Stack horizontal={false} gap={1} sx={styles.root}>
      {!!onToggleAudio && (
        <MenuItem
          label='Enable audio'
          sx={styles.menuItem}
          trailing={
            <Switch
              key={includeAudio ? 'audio-on' : 'audio-off'}
              checked={!!includeAudio}
              onChange={() => onToggleAudio()}
            />

          }
        />
      )}
      <Text variant='label' size='lg' sx={styles.header}>
        Compression
      </Text>
      <Paper outlined sx={styles.sliderBlock}>
        <Text variant='label' size='lg' sx={styles.sliderCurrentLabel}>
          {getQualityLabel(quality)}
        </Text>
        <Slider
          min={0}
          max={QUALITY_SLIDER_VALUES.length - 1}
          step={1}
          value={QUALITY_SLIDER_VALUES.indexOf(quality)}
          onChange={(value) => {
            const next = QUALITY_SLIDER_VALUES[value]
            if (next) {
              onQualityChange(next)
            }
          }}
        />
      </Paper>
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
  },
  header: {
    color: palette.onSurfaceVariant,
    marginBottom: spacing.margin1,
  },
  sliderBlock: {
    padding: spacing.padding2,
    textAlign: 'center',
  },
  menuItem: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
  },
  sliderCurrentLabel: {
    color: palette.onSurfaceVariant,
    textAlign: 'center',
  },
})

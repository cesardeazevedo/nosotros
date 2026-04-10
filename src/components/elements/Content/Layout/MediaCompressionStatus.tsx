import { compressionStateAtom } from '@/atoms/compression.atoms'
import { Text } from '@/components/ui/Text/Text'
import { useAtomValue } from 'jotai'
import { css, html } from 'react-strict-dom'
import { MediaScrim } from './MediaScrim'

type Props = {
  src: string
}

export const MediaCompressionStatus = (props: Props) => {
  const { src } = props
  const compression = useAtomValue(compressionStateAtom)[src || '']

  return (
    <>
      {compression && (
        <MediaScrim>
          <Text variant='label' size='sm' sx={styles.compressLabel}>
            {compression.label}
          </Text>
          <html.div style={styles.progressTrack}>
            <html.div style={styles.progressFill(compression.progress)} />
          </html.div>
        </MediaScrim>
      )}
    </>
  )
}

const styles = css.create({
  compressLabel: {
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressTrack: {
    width: 160,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: (progress: number) => ({
    width: `${Math.min(100, Math.max(0, progress))}%`,
    height: '100%',
    backgroundColor: 'white',
  }),
})

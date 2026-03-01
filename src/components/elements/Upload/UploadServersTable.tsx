import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoUp, IconPlus } from '@tabler/icons-react'
import { memo, useRef } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  kind: Kind.BlossomServerList | Kind.NIP96ServerList
  servers: string[] | undefined
  suggestions?: string[]
  onDelete: (url: string) => void
  onSubmit: (url: string) => void
}

export const UploadServersTable = memo(function UploadServersTable(props: Props) {
  const { kind, servers = [], suggestions = [], onDelete, onSubmit } = props
  const ref = useRef<HTMLInputElement>(null)
  const label = kind === Kind.BlossomServerList ? 'Blossom' : 'NIP-96'

  return (
    <Stack grow horizontal={false} gap={1} align='flex-start' sx={styles.root}>
      <Paper outlined sx={styles.paper}>
        <Text variant='title' size='md' sx={styles.sectionTitle}>
          {label} Servers
        </Text>

        <table style={{ width: '100%' }} cellPadding={4}>
          <thead>
            <tr>
              <th align='left' {...css.props(styles.cell$first)}></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {servers.map((url) => (
              <tr key={url} {...css.props(styles.row)}>
                <td {...css.props(styles.cell$first)}>
                  <Chip
                    variant='input'
                    icon={<IconPhotoUp size={18} strokeWidth='1.5' />}
                    label={url.replace('https://', '')}
                  />
                </td>
                <td align='right' {...css.props(styles.cell$last)}>
                  <Button variant='danger' onClick={() => onDelete(url)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Popover
          placement='bottom-start'
          contentRenderer={({ close }) => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.paperPopover}>
              <Stack gap={1}>
                <SearchField ref={ref} sx={styles.search} leading={false} placeholder='https://' />
                <Button
                  variant='filled'
                  onClick={() => {
                    const value = ref.current?.value
                    if (value) {
                      const url = new URL(!value.startsWith('http') ? 'https://' + value : value)
                      onSubmit(url.href)
                      close()
                    }
                  }}>
                  Add
                </Button>
              </Stack>
            </Paper>
          )}>
          {({ open, getProps, setRef }) => (
            <Stack horizontal={false} align='flex-start' sx={styles.footer}>
              <Chip
                {...getProps()}
                ref={setRef}
                onClick={open}
                variant='input'
                label={`Add ${label} Server`}
                icon={<IconPlus size={18} />}
              />
              {suggestions.length > 0 && (
                <Stack horizontal={false} align='flex-start' gap={0.5} sx={styles.suggestions}>
                  <Text variant='label' size='sm' sx={styles.suggestionsLabel}>
                    Suggestions:
                  </Text>
                  <Stack wrap align='flex-start' gap={0.5}>
                    {suggestions.map((url) => (
                      <Chip
                        key={url}
                        variant='input'
                        label={url.replace('https://', '')}
                        icon={<IconPlus size={16} />}
                        onClick={() => onSubmit(url)}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </Popover>
      </Paper>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    paddingTop: spacing.padding2,
    paddingInline: spacing.padding2,
  },
  sectionTitle: {
    paddingTop: spacing.padding2,
    paddingInline: spacing.padding2,
    color: palette.onSurfaceVariant,
  },
  paper: {
    width: '100%',
    // width: 350,
    // padding: spacing.padding1,
  },
  paperPopover: {
    width: 350,
    padding: spacing.padding1,
  },
  search: {
    height: 40,
  },
  row: {
    height: 50,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  cell$first: {
    paddingLeft: spacing.padding2,
  },
  cell$last: {
    paddingRight: spacing.padding2,
  },
  footer: {
    padding: spacing.padding2,
  },
  suggestions: {
    marginTop: spacing['margin0.5'],
    flexWrap: 'wrap',
  },
  suggestionsLabel: {
    color: palette.onSurfaceVariant,
  },
})

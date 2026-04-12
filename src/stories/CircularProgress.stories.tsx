import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { html, css } from 'react-strict-dom'

const meta = {
  title: 'UI/Components/CircularProgress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CircularProgress>

export default meta
type Story = StoryObj<typeof meta>

const styles = css.create({
  container: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
})

export const AllSizes: Story = {
  render() {
    return (
      <html.div style={styles.container}>
        <html.div style={styles.item}>
          <html.div>XS</html.div>
          <CircularProgress size='xs' />
        </html.div>
        <html.div style={styles.item}>
          <html.div>SM</html.div>
          <CircularProgress size='sm' />
        </html.div>
        <html.div style={styles.item}>
          <html.div>MD</html.div>
          <CircularProgress size='md' />
        </html.div>
        <html.div style={styles.item}>
          <html.div>LG</html.div>
          <CircularProgress size='lg' />
        </html.div>
        <html.div style={styles.item}>
          <html.div>XL</html.div>
          <CircularProgress size='xl' />
        </html.div>
        <html.div style={styles.item}>
          <html.div>Disabled</html.div>
          <CircularProgress size='md' disabled />
        </html.div>
      </html.div>
    )
  },
}

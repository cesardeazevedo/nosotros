import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { UserRoot } from '@/components/elements/User/UserRoot'
import { setEventData } from '@/hooks/query/queryUtils'
import { fakeEventMeta } from '@/utils/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'

const createUser = (pubkey: string, about: string, display_name = 'Test User') => {
  return fakeEventMeta({
    kind: 0,
    pubkey,
    content: JSON.stringify({
      display_name,
      picture: 'https://placehold.co/100x100',
      about,
    }),
  })
}

const meta = {
  title: 'Components/UserRoot',
  component: UserRoot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return (
        <CenteredContainer margin>
          <PaperContainer>
            <Story />
          </PaperContainer>
        </CenteredContainer>
      )
    },
  ],
  args: {
    pubkey: 'p1',
    border: false,
    renderBanner: false,
  },
} satisfies Meta<typeof UserRoot>

export default meta
type Story = StoryObj<typeof meta>

export const AllBioVariations: Story = {
  loaders: [
    () => {
      setEventData(createUser('p1', 'Lorem ipsum dolor sit amet consectetur', 'Short Bio'))
      setEventData(createUser('p2', '', 'Empty Bio'))
      setEventData(
        createUser(
          'p3',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim.',
          'Long Bio',
        ),
      )
      setEventData(
        createUser(
          'p4',
          'Lorem ipsum dolor nprofile1qqsw3mfhnrr0l6ll5zzsrtpeufckv2lazc8k3ru5c3wkjtv8vlwngkspz9mhxue69uhkummnw3ezuamfdejj7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uqsuamnwvaz7tmwdaejumr0dsx2em9x nprofile1qqsw3mfhnrr0l6ll5zzsrtpeufckv2lazc8k3ru5c3wkjtv8vlwngkspz9mhxue69uhkummnw3ezuamfdejj7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uqsuamnwvaz7tmwdaejumr0dsx2em9y nprofile1qqsw3mfhnrr0l6ll5zzsrtpeufckv2lazc8k3ru5c3wkjtv8vlwngkspz9mhxue69uhkummnw3ezuamfdejj7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uqsuamnwvaz7tmwdaejumr0dsx2em9z',
          'Multiple Nprofiles',
        ),
      )
      setEventData(
        createUser(
          'p5',
          'Lorem ipsum `const veryLongFunctionNameThatShouldWrapProperly = (parameterOne, parameterTwo, parameterThree) => { return somethingReallyLongThatMightCauseLayoutIssues }` dolor sit amet',
          'Long Backticked Content',
        ),
      )
      setEventData(
        createUser(
          'p6',
          'Lorem ipsum `dolor` sit amet `consectetur adipiscing elit` sed non `risus suspendisse lectus` tortor dignissim',
          'Multiple Backticks',
        ),
      )
      setEventData(
        createUser(
          'p7',
          'Lorem ipsum dolor sit amet nprofile1qqsw3mfhnrr0l6ll5zzsrtpeufckv2lazc8k3ru5c3wkjtv8vlwngkspz9mhxue69uhkummnw3ezuamfdejj7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uqsuamnwvaz7tmwdaejumr0dsx2em9x consectetur `adipiscing elit` sed non risus',
          'Mixed Content',
        ),
      )
      setEventData(
        createUser(
          'p8',
          'Lorem ipsum https://this-is-a-very-long-url-that-should-wrap-properly-and-not-break-the-layout.com/articles/consectetur-adipiscing-elit dolor sit amet',
          'Long URL',
        ),
      )
      setEventData(
        createUser(
          'p9',
          'Lorem ipsum dolor sit amet nprofile1qqsw3mfhnrr0l6ll5zzsrtpeufckv2lazc8k3ru5c3wkjtv8vlwngkspz9mhxue69uhkummnw3ezuamfdejj7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uqsuamnwvaz7tmwdaejumr0dsx2em9x consectetur `adipiscing elit sed non risus suspendisse` lectus https://long-url.com/path nprofile1qqsw3mfhnrr0l6ll5zzsrtpeufckv2lazc8k3ru5c3wkjtv8vlwngkspz9mhxue69uhkummnw3ezuamfdejj7qg4waehxw309aex2mrp0yhxgctdw4eju6t09uqsuamnwvaz7tmwdaejumr0dsx2em9y sit amet `more code` dignissim',
          'Stress Test',
        ),
      )
    },
  ],
  render: () => (
    <>
      <UserRoot pubkey='p1' border />
      <UserRoot pubkey='p2' border />
      <UserRoot pubkey='p3' border />
      <UserRoot pubkey='p4' border />
      <UserRoot pubkey='p5' border />
      <UserRoot pubkey='p6' border />
      <UserRoot pubkey='p7' border />
      <UserRoot pubkey='p8' border />
      <UserRoot pubkey='p9' border />
    </>
  ),
}

/* eslint-disable no-empty-pattern */
import { test as base, expect } from '@playwright/test'
import { Kind } from 'constants/kinds'
import { nip19 } from 'nostr-tools'
import { fakeEvent, fakeSignature } from 'utils/faker'
import { WebSocketServerCustom } from './helpers/websocket.server'

const delay = (timeout = 500) => new Promise((r) => setTimeout(r, timeout))

type Relays = Array<WebSocketServerCustom>

const RELAY_1 = 'ws://localhost:5001'
const RELAY_2 = 'ws://localhost:5002'
const RELAY_3 = 'ws://localhost:5003'
const RELAY_4 = 'ws://localhost:5004'

const servers = [RELAY_1, RELAY_2, RELAY_3, RELAY_4]

const relays: Record<string, WebSocketServerCustom> = {}

// Get the default recommended authors
const authors = JSON.parse(process.env.VITE_RECOMMENDED_PUBKEYS || '{}')

type Fixtures = {
  getRelays: () => Promise<Relays>
  expectInitialFeed: (relay: WebSocketServerCustom, authors: string[]) => Promise<string>
  expectSeenAt: (relays: WebSocketServerCustom[]) => Promise<void>
}

const test = base.extend<Fixtures>({
  getRelays: async ({}, use) => {
    await use(async () => {
      for (const url of servers) {
        const wss = new WebSocketServerCustom({ port: parseInt(url.split(':')[2]), path: '/' })
        wss.initialize()
        relays[wss.url] = wss
      }
      return Object.values(relays)
    })
    await delay(100)
    for (const wss of Object.values(relays)) {
      wss.close()
    }
  },
  expectInitialFeed: async ({}, use) => {
    await use(async (relay: WebSocketServerCustom, authors: string[]) => {
      const reqId = await relay.expectMessage([
        // feed notes
        {
          kinds: [1, 30023],
          since: expect.any(Number),
          until: expect.any(Number),
          authors,
        },
        // feed users
        { kinds: [0, 10002], authors },
      ])
      return reqId
    })
  },
  expectSeenAt: async ({ page }, use) => {
    await use(async (relays: WebSocketServerCustom[]) => {
      const container = page.getByLabel('Seen on relays')
      const tooltip = page.getByRole('tooltip')
      const button = container.getByRole('button')
      await expect(container).toBeVisible()
      await expect(container).toHaveText(relays.length.toString())
      await expect(tooltip).not.toBeVisible()
      await button.hover()
      await expect(tooltip).toBeVisible()
      await expect(tooltip).toHaveText(`Seen on ${relays.map(() => 'localhost').join('\n')}`)
      await delay()
      await page.mouse.move(0, 0)
    })
  },
})

test.skip('Should expect a basic note and user info', async ({ page, getRelays, expectInitialFeed, expectSeenAt }) => {
  const [relay1, relay2, relay3, relay4] = await getRelays()
  await page.goto('http://localhost:8000/')
  await relay1.waitForConnection()
  await relay2.waitForConnection()
  await relay3.waitForConnection()
  await relay4.waitForConnection()

  const reqId = await expectInitialFeed(relay1, authors)
  // Assert initial feed and user subscriptions
  const user = page.getByText('UserTest')
  const post = page.getByText('Hello World')

  await expect(user).not.toBeVisible()
  await expect(post).not.toBeVisible()

  // Send note back to the frontend
  await relay1.send(reqId, fakeSignature(fakeEvent({ kind: Kind.Metadata })))
  await expect(post).toBeVisible()
  await expect(user).not.toBeVisible()

  // Send user back to the frontend
  await relay1.send(reqId, fakeSignature(fakeEvent({ kind: Kind.Metadata, pubkey: authors[0] })))
  await expect(user).toBeVisible()

  await expectSeenAt([relay1])
})

test.skip('Should expect a basic note and fetch the mentioned note', async ({ page, getRelays, expectInitialFeed }) => {
  const [relay1, relay2] = await getRelays()
  // await delay(5000)
  await page.goto('http://localhost:8000/')
  await relay1.waitForConnection()
  await relay2.waitForConnection()

  const reqId = await expectInitialFeed(relay1, authors)

  const mentioned = fakeSignature(fakeEvent({ pubkey: '2', content: 'Related Note' }))

  const encodedNote = nip19.neventEncode({
    id: mentioned.id,
    author: mentioned.pubkey,
    relays: [RELAY_2],
  })
  await relay1.send(reqId, fakeSignature(fakeEvent({ pubkey: authors[0] })))
  await relay1.send(reqId, fakeSignature(fakeEvent({ content: `Check this nostr:${encodedNote}` })))
  const post = page.getByText('Check this')
  await expect(post).toBeVisible()

  const expectedRelatedMessage = [
    {
      kinds: [Kind.Metadata, Kind.RelayList],
      authors: [mentioned.pubkey],
    },
    {
      ids: [mentioned.id],
    },
    // PostList will trigger a new pagination request
    {
      kinds: [Kind.Text, Kind.Article],
      authors,
      since: expect.any(Number),
      until: expect.any(Number),
    },
  ]
  const reqId2 = await relay1.expectMessage(expectedRelatedMessage)

  await delay()
  await relay1.send(reqId2, mentioned)
})

test.skip('Should receive a reply message then expect the parent note', async ({
  page,
  getRelays,
  expectInitialFeed,
}) => {
  const [relay1, relay2] = await getRelays()
  await page.goto('http://localhost:8000/')
  await relay1.waitForConnection()
  await relay2.waitForConnection()

  const reqId = await expectInitialFeed(relay1, authors)

  const parentNote = fakeSignature(fakeEvent({ content: 'Parent Note' }))
  const replyNote = fakeSignature(fakeEvent({ content: 'Reply Note', tags: [['e', parentNote.id, '', 'root']] }))
  await relay1.send(reqId, replyNote)

  const parent = page.getByText('Parent Note')
  const reply = page.getByText('Reply Note')
  await expect(parent).not.toBeVisible()
  await expect(reply).not.toBeVisible()
  await delay(1000)

  const reqId2 = await relay1.expectMessage([
    {
      kinds: [Kind.Metadata, Kind.RelayList],
      authors: [replyNote.pubkey],
    },
    {
      ids: [parentNote.id],
    },
    {
      kinds: [Kind.Text, Kind.Article],
      authors,
      since: expect.any(Number),
      until: expect.any(Number),
    },
  ])
  await relay1.send(reqId2, parentNote)
  await expect(reply).toBeVisible()
  await expect(parent).toBeVisible()
})

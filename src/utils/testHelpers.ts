import WS from 'jest-websocket-mock'
import { MessageReceived, MessageTypes } from 'stores/core/relay'
import { SubscriptionEvents } from 'stores/core/subscription'
import { PostStore } from 'stores/modules/post.store'

export const delay = (timeout = 500) => new Promise((r) => setTimeout(r, timeout))

export async function sendMessages(server: WS, reqId: string, messages: unknown[]) {
  messages.forEach((message) => server.send([SubscriptionEvents.EVENT, reqId, message]))
  await delay(100)
}

export async function expectMessage(server: WS, ...message: unknown[]): Promise<string> {
  const nextMessage = (await server.nextMessage) as MessageReceived
  expect(nextMessage).toMatchObject([MessageTypes.REQ, expect.any(String), ...message])
  return nextMessage[1]
}

type JSONFeed = {
  [key: string]: {
    replies?: Array<JSONFeed>
  }
}

/**
 * JSON representation of the feed posts and it's replies, only for testing
 */
export function getJSONFeed(feed: Map<string, PostStore>) {
  function getFeedStructure(post: PostStore | null): JSONFeed | null {
    if (!post) {
      return null
    }
    const replies = Array.from(post.replies.keys())
      .map((key) => getFeedStructure(post.replies.get(key) || null))
      .filter(Boolean)
    return {
      [post.id]: replies.length ? { replies } : {},
    } as JSONFeed
  }
  return Array.from(feed.keys())
    .map((key) => getFeedStructure(feed.get(key) || null))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {})
}

import { test } from 'utils/fixtures'
import { parseImeta } from '../nip92.imeta'

describe('NIP-92 (imeta)', () => {
  test('assert imeta fields', () => {
    const res = parseImeta([
      [
        'imeta',
        'url https://host1.com/1.jpg',
        'm image/jpeg',
        'dim 3024x4032',
        'blurhash eVF$^OI:${M{o#*0-nNFxakD-?xVM}WEWB%iNKxvR-oetmo#R-aen$',
        'alt A scenic photo overlooking the coast of Costa Rica',
        'fallback https://host2.com/1.jpg',
        'fallback https://host3.com/1.jpg',
      ],
      [
        'imeta',
        'url https://host1.com/2.jpg',
        'm image/jpeg',
        'dim 3024x4032',
        'bh eVF$^OI:${M{o#*0-nNFxakD-?xVM}WEWB%iNKxvR-oetmo#R-aen$',
        'alt A scenic photo overlooking the coast of Costa Rica 2',
        'fallback https://host2.com/2.jpg',
        'fallback https://host3.com/2.jpg',
        // fallback with different settings
        'url https://host4.com/2.jpg',
        'm image/jpeg',
        'dim 1024x1024',
        'bh eVF$^OI:${M{o#*0-nNFxakD-?xVM}WEWB%iNKxvR-oetmo#R-aen$',
        'alt A scenic photo overlooking the coast of Costa Rica 2',
        'fallback https://host2.com/2.jpg',
        'fallback https://host3.com/2.jpg',
      ],
    ])
    expect(res).toStrictEqual({
      'https://host1.com/1.jpg': {
        m: 'image/jpeg',
        dim: {
          width: 3024,
          height: 4032,
        },
        url: 'https://host1.com/1.jpg',
        blurhash: 'eVF$^OI:${M{o#*0-nNFxakD-?xVM}WEWB%iNKxvR-oetmo#R-aen$',
        alt: 'A scenic photo overlooking the coast of Costa Rica',
        fallback: ['https://host2.com/1.jpg', 'https://host3.com/1.jpg'],
      },
      'https://host1.com/2.jpg': {
        m: 'image/jpeg',
        dim: {
          width: 3024,
          height: 4032,
        },
        url: 'https://host1.com/2.jpg',
        blurhash: 'eVF$^OI:${M{o#*0-nNFxakD-?xVM}WEWB%iNKxvR-oetmo#R-aen$',
        alt: 'A scenic photo overlooking the coast of Costa Rica 2',
        fallback: ['https://host2.com/2.jpg', 'https://host3.com/2.jpg'],
      },
      'https://host4.com/2.jpg': {
        m: 'image/jpeg',
        dim: {
          width: 1024,
          height: 1024,
        },
        url: 'https://host4.com/2.jpg',
        blurhash: 'eVF$^OI:${M{o#*0-nNFxakD-?xVM}WEWB%iNKxvR-oetmo#R-aen$',
        alt: 'A scenic photo overlooking the coast of Costa Rica 2',
        fallback: ['https://host2.com/2.jpg', 'https://host3.com/2.jpg'],
      },
    })
  })
})

import { describe, expect, it } from 'vitest'
import {
  EMPTY_BACKDROP_POOLS,
  availableEmptyBackdrops,
  collectEmptyBackdropAssets,
  emptyBackdropAssets,
  fileNameFromAssetPath,
  pickEmptyBackdropUrl,
} from '@/utils/emptyBackdrop'

describe('emptyBackdrop', () => {
  it('maps each home tab to a single dedicated jpg pool', () => {
    expect(EMPTY_BACKDROP_POOLS.all).toEqual(['3.1.jpg', '3.2.jpg', '3.3.jpg'])
    expect(EMPTY_BACKDROP_POOLS.catering).toEqual(['1.1.jpg', '1.2.jpg', '1.3.jpg', '1.4.jpg', '1.5.jpg'])
    expect(EMPTY_BACKDROP_POOLS.other).toEqual(['2.1.jpg', '2.2.jpg'])
  })

  it('ignores splash photos and only keeps numbered empty-state files', () => {
    const assets = collectEmptyBackdropAssets({
      '/src/assets/1.png': '/assets/1.png',
      '/src/assets/2.jpg': '/assets/2.jpg',
      '/src/assets/1.1.jpg': '/assets/1.1.jpg',
      '/src/assets/3.2.jpg': '/assets/3.2.jpg',
      '/src/assets/logo.svg': '/assets/logo.svg',
    })
    expect(assets).toEqual({
      '1.1.jpg': '/assets/1.1.jpg',
      '3.2.jpg': '/assets/3.2.jpg',
    })
  })

  it('returns undefined when the tab pool is missing from disk', () => {
    expect(pickEmptyBackdropUrl('other', {})).toBeUndefined()
    expect(availableEmptyBackdrops('all', { '1.1.jpg': '/x' })).toEqual([])
  })

  it('picks exactly one url from the matching tab pool', () => {
    const assets = {
      '3.1.jpg': '/a',
      '3.2.jpg': '/b',
      '3.3.jpg': '/c',
      '1.1.jpg': '/food',
    }
    const picked = pickEmptyBackdropUrl('all', assets, () => 0.99)
    expect(picked).toBe('/c')
    expect(availableEmptyBackdrops('all', assets)).toHaveLength(3)
    expect(pickEmptyBackdropUrl('catering', assets, () => 0)).toBe('/food')
  })

  it('skips holes in a pool instead of failing the empty state', () => {
    const assets = { '2.2.jpg': '/wild-2' }
    expect(pickEmptyBackdropUrl('other', assets, () => 0)).toBe('/wild-2')
  })

  it('loads the committed jpg pool through bundled imports', () => {
    expect(Object.keys(emptyBackdropAssets).sort()).toEqual([
      '1.1.jpg',
      '1.2.jpg',
      '1.3.jpg',
      '1.4.jpg',
      '1.5.jpg',
      '2.1.jpg',
      '2.2.jpg',
      '3.1.jpg',
      '3.2.jpg',
      '3.3.jpg',
    ])
    expect(emptyBackdropAssets['2.jpg']).toBeUndefined()
    expect(pickEmptyBackdropUrl('all')).toMatch(/\.(jpg|jpeg)(\?.*)?$/i)
  })

  it('reads the basename from glob keys', () => {
    expect(fileNameFromAssetPath('../assets/3.1.jpg')).toBe('3.1.jpg')
    expect(fileNameFromAssetPath('/src/assets/1.4.jpg?url')).toBe('1.4.jpg')
  })
})

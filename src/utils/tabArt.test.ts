import { describe, expect, it } from 'vitest'
import {
  TAB_ART_POOLS,
  availableTabArt,
  collectTabArtAssets,
  fileNameFromAssetPath,
  pickTabArtUrl,
  tabArtAssets,
} from '@/utils/tabArt'

describe('tabArt', () => {
  it('maps each home tab to a single dedicated jpg pool', () => {
    expect(TAB_ART_POOLS.all).toEqual(['3.1.jpg', '3.2.jpg', '3.3.jpg'])
    expect(TAB_ART_POOLS.catering).toEqual(['1.1.jpg', '1.2.jpg', '1.3.jpg', '1.4.jpg', '1.5.jpg'])
    expect(TAB_ART_POOLS.other).toEqual(['2.1.jpg', '2.2.jpg'])
  })

  it('ignores splash photos and only keeps numbered tab-art files', () => {
    const assets = collectTabArtAssets({
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
    expect(pickTabArtUrl('other', {})).toBeUndefined()
    expect(availableTabArt('all', { '1.1.jpg': '/x' })).toEqual([])
  })

  it('picks exactly one url from the matching tab pool', () => {
    const assets = {
      '3.1.jpg': '/a',
      '3.2.jpg': '/b',
      '3.3.jpg': '/c',
      '1.1.jpg': '/food',
    }
    expect(pickTabArtUrl('all', assets, () => 0.99)).toBe('/c')
    expect(availableTabArt('all', assets)).toHaveLength(3)
    expect(pickTabArtUrl('catering', assets, () => 0)).toBe('/food')
  })

  it('skips holes in a pool instead of failing the tab', () => {
    const assets = { '2.2.jpg': '/wild-2' }
    expect(pickTabArtUrl('other', assets, () => 0)).toBe('/wild-2')
  })

  it('loads the committed jpg pool through bundled imports', () => {
    expect(Object.keys(tabArtAssets).sort()).toEqual([
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
    expect(tabArtAssets['2.jpg']).toBeUndefined()
    expect(pickTabArtUrl('all')).toMatch(/\.(jpg|jpeg)(\?.*)?$/i)
  })

  it('reads the basename from asset paths', () => {
    expect(fileNameFromAssetPath('../assets/3.1.jpg')).toBe('3.1.jpg')
    expect(fileNameFromAssetPath('/src/assets/1.4.jpg?url')).toBe('1.4.jpg')
  })
})

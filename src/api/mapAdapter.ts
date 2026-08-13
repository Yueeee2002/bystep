/** 地图适配器：V1.1 预留品类配色，V2.0 再接入高德/百度 SDK */

export interface LatLng {
  lng: number
  lat: number
}

export interface MapInitOptions {
  center?: LatLng
  zoom?: number
}

export const MAP_MARKER_COLORS = {
  catering: '#e8c4a8',
  other: '#c5cdd6',
} as const

export interface MapAdapter {
  initMap(container: HTMLElement, options?: MapInitOptions): void
  addMarker(lng: number, lat: number, title?: string, category?: keyof typeof MAP_MARKER_COLORS): void
  searchRoute(from: LatLng, to: LatLng): void
}

const notImplemented = (method: string) => {
  console.info(`[mapAdapter] ${method} 将在 V2.0 接入地图 SDK`)
}

export const mapAdapter: MapAdapter = {
  initMap() {
    notImplemented('initMap')
  },
  addMarker() {
    notImplemented('addMarker')
  },
  searchRoute() {
    notImplemented('searchRoute')
  },
}

export default mapAdapter

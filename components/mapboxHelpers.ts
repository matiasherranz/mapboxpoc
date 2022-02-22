import { MutableRefObject, RefObject } from 'react'

import mapboxgl, { GeoJSONSource } from 'mapbox-gl'
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson'

import styles from './Mapbox.module.scss'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
const BE_TOKEN = process.env.NEXT_PUBLIC_BE_TOKEN
const BASE_API_URL = process.env.NEXT_PUBLIC_BE_BASE_URL || ''

export const initializeMap = (
  map: MutableRefObject<mapboxgl.Map | undefined>,
  mapContainer: RefObject<HTMLDivElement>,
  lat: number,
  lng: number,
  zoom: number
) => {
  if (map.current) return // initialize map only once
  map.current = new mapboxgl.Map({
    container: mapContainer.current ?? '',
    // style: 'mapbox://styles/mapbox/streets-v11',
    // style: 'mapbox://styles/mapbox/dark-v10',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [lng, lat],
    zoom: zoom,
  })
}

export const setupOnLoad = (
  map: MutableRefObject<mapboxgl.Map | undefined>
) => {
  map?.current?.on('load', async () => {
    const sum_or_size = [
      'case',
      ['has', 'point_count'],
      ['get', 'sum'],
      ['get', 'size'],
    ]

    // Fixed Layer
    map?.current?.addSource('lev-clusters-fixed', {
      type: 'geojson',
      // @ts-ignore: loading format
      data: await fetchData(map?.current),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
      clusterProperties: {
        sum: ['+', ['get', 'size']],
      },
    })

    map?.current?.addLayer({
      id: 'clusters-circles',
      type: 'circle',
      source: 'lev-clusters-fixed',
      paint: {
        'circle-color': [
          'step',
          sum_or_size,
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1',
        ],
        'circle-radius': ['step', sum_or_size, 20, 5_000, 30, 10_000, 40],
      },
      maxzoom: 13,
    })

    map?.current?.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'lev-clusters-fixed',
      layout: {
        'text-field': [
          'case',
          ['has', 'point_count'],
          ['get', 'sum'],
          ['get', 'size'],
        ],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      maxzoom: 13,
    })

    // Hot Layer
    map?.current?.addSource('lev-clusters-variable', {
      type: 'geojson',
      // @ts-ignore: loading format
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
      clusterProperties: {
        sum: ['+', ['get', 'size']],
      },
    })

    map?.current?.addLayer({
      id: 'clusters-circles-variable',
      type: 'circle',
      source: 'lev-clusters-variable',
      paint: {
        'circle-color': [
          'step',
          sum_or_size,
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1',
        ],
        'circle-radius': ['step', sum_or_size, 20, 5_000, 30, 10_000, 40],
      },
      minzoom: 13,
      maxzoom: 15,
    })

    map?.current?.addLayer({
      id: 'cluster-count-variable',
      type: 'symbol',
      source: 'lev-clusters-variable',
      layout: {
        'text-field': [
          'case',
          ['has', 'point_count'],
          ['get', 'sum'],
          ['get', 'size'],
        ],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      minzoom: 13,
      maxzoom: 15,
    })

    // Point Layer
    map?.current?.addSource('lev-points', {
      type: 'geojson',
      // @ts-ignore: loading format
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      cluster: true,
      clusterMaxZoom: 16,
      clusterRadius: 50,
    })

    map?.current?.addLayer({
      id: 'property_cluster',
      type: 'circle',
      source: 'lev-points',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#51bbd6',
        'circle-radius': 10,
      },
      minzoom: 15,
    })

    map?.current?.addLayer({
      id: 'property_cluster_label',
      type: 'symbol',
      source: 'lev-points',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      minzoom: 15,
    })

    map?.current?.addLayer({
      id: 'property_point',
      type: 'circle',
      source: 'lev-points',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#FFFFFF',
        'circle-radius': 5,
      },
      minzoom: 15,
    })

    //Adding popup for points
    // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/
    map?.current?.on('click', 'property_point', (target) => {
      const allPoints = target?.features ?? null
      const firstPoint = allPoints ? allPoints[0] : null

      if (!firstPoint) return

      // @ts-ignore
      const coordinates = firstPoint?.geometry.coordinates
      const lenderName = firstPoint.properties ? firstPoint.properties['lender_name'] : null
      const assetCategory = firstPoint.properties ? firstPoint.properties['asset_category'] : null
      const recordingDate = firstPoint.properties ? firstPoint.properties['recording_date'] : '2010-08-13'
      const mortgageAmount = firstPoint.properties ? firstPoint.properties['mortgage_amount'] : '499000.0'
      const address = firstPoint.properties ? firstPoint.properties['address'] : '34 E 4TH ST, NEW YORK, NY 10003'

      const description = `<article class=${styles.popupWrapper}>
        <header>
          ${ address ? `<strong>${address}</strong>` : '' }
        </header>
        <div class=${styles.popupContent}>
          <div>${ lenderName ? `<span class=${styles.popupContentTitle}>Lender Name</span>: ${lenderName}` : '' }</div>
          <div>${ assetCategory ? `<span class=${styles.popupContentTitle}>Asset Category</span>: ${assetCategory}` : '' }</div>
          <div>${ mortgageAmount ? `<span class=${styles.popupContentTitle}>Mortgage Amount</span>: ${mortgageAmount}` : '' }</div>
          <div>${ recordingDate ? `<span class=${styles.popupContentTitle}>Recording Date</span>: ${recordingDate}` : '' }</div>
        </div>
      </article>`

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map?.current as mapboxgl.Map)
    })
  })
}

// TODO: We can add this optimization at some point:
// https://docs.mapbox.com/mapbox-gl-js/example/cluster-html/
// export const setupOnRender = (map) => {
//   map.on('render', () => {
//     if (!map.isSourceLoaded('earthquakes')) return
//     updateMarkers()
//   })
// }

type GeoData =
  | String
  | Feature<Geometry, GeoJsonProperties>
  | FeatureCollection<Geometry, GeoJsonProperties>

const fetchData = async (current_map: mapboxgl.Map): Promise<GeoData> => {
  try {
    const zoom = Math.min(Number(current_map?.getZoom().toFixed(0)), 12)
    const topLeft = current_map?.getBounds().getNorthWest()
    const bottomRight = current_map?.getBounds().getSouthEast()
    const response = await fetch(
      `${BASE_API_URL}/lender_search/map` +
        `?bottom_right_lon=${bottomRight.lng.toFixed(4)}` +
        `&bottom_right_lat=${bottomRight.lat.toFixed(4)}` +
        `&top_left_lon=${topLeft.lng.toFixed(4)}` +
        `&top_left_lat=${topLeft.lat.toFixed(4)}` +
        `&precision=${zoom}`,
      {
        headers: new Headers({
          Authorization: `Bearer ${BE_TOKEN}`,
          'X-Origin-App': 'test',
          cors: 'no-cors',
        }),
        method: 'GET',
      }
    )
    const data = await response.json()

    return {
      type: 'FeatureCollection',
      features: data,
    }
  } catch (err) {
    console.log('ERROR', err)
    throw new Error('Error fetching data')
  }
}

const fetchAndRender = async (currentMap: mapboxgl.Map) => {
  const currentMapSource = currentMap?.getSource(
    'lev-clusters-variable'
  ) as GeoJSONSource

  return currentMapSource?.setData(await fetchData(currentMap))
}

const fetchAndRenderPoints = async (currentMap: mapboxgl.Map) => {
  const currentMapSource = currentMap?.getSource('lev-points') as GeoJSONSource
  const data = await fetchDataPoints(currentMap)
  return currentMapSource?.setData(data as GeoData)
}

const fetchDataPoints = async (current_map: mapboxgl.Map) => {
  try {
    const topLeft = current_map?.getBounds().getNorthWest()
    const bottomRight = current_map?.getBounds().getSouthEast()
    const response = await fetch(
      `${BASE_API_URL}/lender_search/map/properties` +
        `?bottom_right_lon=${bottomRight.lng.toFixed(4)}` +
        `&bottom_right_lat=${bottomRight.lat.toFixed(4)}` +
        `&top_left_lon=${topLeft.lng.toFixed(4)}` +
        `&top_left_lat=${topLeft.lat.toFixed(4)}`,
      {
        headers: new Headers({
          Authorization: `Bearer ${BE_TOKEN}`,
          'X-Origin-App': 'test',
        }),
        method: 'GET',
      }
    )
    const data = await response.json()

    return {
      type: 'FeatureCollection',
      features: data,
    }
  } catch (err) {
    console.log('ERROR', err)

    throw new Error('Error fetching data points')
  }
}

export const setupZoomEnd = (
  map: MutableRefObject<mapboxgl.Map | undefined>,
  zoom: number,
  setZoom: (zoom: number) => void
) => {
  // Querying Logic
  map?.current?.on('zoomend', async () => {
    if (!map?.current) return
    console.log('ZOOMEND START')
    const newZoomLevel = Number(map?.current?.getZoom().toFixed(2))
    if (newZoomLevel >= 12 && zoom < 12) {
      console.log('RERENDER x---')
      fetchAndRender(map?.current)
    }
    if (newZoomLevel >= 14 && zoom < 14) {
      console.log('POINTS xx---')
      fetchAndRenderPoints(map?.current)
    }
    setZoom(newZoomLevel)
    console.log('ZOOMEND DONE')
  })
}

export const setupDragEnd = (
  map: MutableRefObject<mapboxgl.Map | undefined>,
  zoom: number,
  setLat: (lat: number) => void,
  setLng: (lng: number) => void
) => {
  // TODO: Perhaps use debounce for zoom here?
  map?.current?.on('dragend', async () => {
    if (!map?.current) return
    console.log('DRAGEND START')
    if (zoom >= 12 && zoom < 14) {
      console.log('RERENDER <---')
      fetchAndRender(map?.current)
    }
    if (zoom >= 14) {
      console.log('POINTS <<---')
      fetchAndRenderPoints(map?.current)
    }
    setLng(Number(map?.current?.getCenter().lng.toFixed(4)))
    setLat(Number(map?.current?.getCenter().lat.toFixed(4)))
    console.log('DRAGEND DONE')
  })
}

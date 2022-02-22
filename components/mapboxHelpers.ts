import { MutableRefObject } from 'react'

import mapboxgl from 'mapbox-gl'

const BE_TOKEN = '1ba71d9d-96f7-4fe4-a5fa-c978cdae4711'
const API = 'http://0.0.0.0:7680/api/v1/lender_search/map'

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
  })
}

async function fetchAndRender(current_map: mapboxgl.Map) {
  current_map
    ?.getSource('lev-clusters-variable')
    .setData(await fetchData(current_map))
}

async function fetchAndRenderPoints(current_map: mapboxgl.Map) {
  current_map
    ?.getSource('lev-points')
    .setData(await fetchDataPoints(current_map))
}

async function fetchData(current_map: mapboxgl.Map) {
  try {
    const zoom = Math.min(Number(current_map?.getZoom().toFixed(0)), 12)
    const topLeft = current_map?.getBounds().getNorthWest()
    const bottomRight = current_map?.getBounds().getSouthEast()
    const response = await fetch(
      'http://0.0.0.0:7680/api/v1/lender_search/map' +
        `?bottom_right_lon=${bottomRight.lng.toFixed(4)}` +
        `&bottom_right_lat=${bottomRight.lat.toFixed(4)}` +
        `&top_left_lon=${topLeft.lng.toFixed(4)}` +
        `&top_left_lat=${topLeft.lat.toFixed(4)}` +
        `&precision=${zoom}`,
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
    throw new Error('Error fetching data')
  }
}

async function fetchDataPoints(current_map: mapboxgl.Map) {
  try {
    const topLeft = current_map?.getBounds().getNorthWest()
    const bottomRight = current_map?.getBounds().getSouthEast()
    const response = await fetch(
      'http://0.0.0.0:7680/api/v1/lender_search/map/properties' +
        `?bottom_right_lon=${bottomRight.lng.toFixed(4)}` +
        `&bottom_right_lat=${bottomRight.lat.toFixed(4)}` +
        `&top_left_lon=${topLeft.lng.toFixed(4)}` +
        `&top_left_lat=${topLeft.lat.toFixed(4)}`,
      {
        headers: new Headers({
          Authorization: 'Bearer d0de72bd-933a-4156-bc6a-028c54ebaae7',
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

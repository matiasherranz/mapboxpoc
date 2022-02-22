import { useRef, useEffect, useState } from 'react'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import useDebounce from './useDebounce'

import styles from './MapboxPOC.module.scss'
import { setupDragEnd, setupOnLoad, setupZoomEnd } from './mapboxHelpers'

mapboxgl.accessToken =
  'pk.eyJ1Ijoid2lzdGFuLWxldiIsImEiOiJja3RrajFkMHUxbW00MnVuNGJjZXI3dWtqIn0.paako3AHTV0MY1mBGYYgSQ'

const MapboxPOC = () => {
  const mapContainer = useRef(null)
  const map = useRef<mapboxgl.Map | undefined>(undefined)
  const [dLng, lng, setLng] = useDebounce(-121.6353, 500)
  const [dLat, lat, setLat] = useDebounce(34.3217, 500)
  const [dZoom, zoom, setZoom] = useDebounce(5.6, 500)

  useEffect(() => {
    if (map.current) return // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? '',
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [dLng, dLat],
      zoom: dZoom,
    })
  })

  useEffect(() => {
    setupOnLoad(map)
    setupZoomEnd(map, zoom, setZoom)
    setupDragEnd(map, zoom, setLat, setLng)
  }, [setLat, setLng, setZoom, zoom])

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.sidebar}>
        Longitude: {dLng} | Latitude: {dLat} | Zoom: {dZoom}
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}

export default MapboxPOC

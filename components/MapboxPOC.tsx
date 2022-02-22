import { useRef, useEffect, useState } from 'react'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import useDebounce from './useDebounce'

import styles from './MapboxPOC.module.scss'
import {
  initializeMap,
  setupDragEnd,
  setupOnLoad,
  setupZoomEnd,
} from './mapboxHelpers'

const MapboxPOC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | undefined>(undefined)
  const [dLng, lng, setLng] = useDebounce(-121.6353, 500)
  const [dLat, lat, setLat] = useDebounce(34.3217, 500)
  const [dZoom, zoom, setZoom] = useDebounce(5.6, 500)

  // Init Mapbox's `map`
  useEffect(() => {
    initializeMap(map, mapContainer, dLat, dLng, dZoom)
  })

  // Setup Mapbox's `onload` event
  useEffect(() => {
    setupOnLoad(map)
  }, [setLat, setLng, setZoom, dZoom])

  // Setup Mapbox's `zoomend` event
  useEffect(() => {
    setupZoomEnd(map, dZoom, setZoom)
  }, [setZoom, dZoom])

  // Setup Mapbox's `dragend` event
  useEffect(() => {
    setupDragEnd(map, dZoom, setLat, setLng)
  }, [setLat, setLng, dZoom])

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
